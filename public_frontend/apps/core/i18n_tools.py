"""
Работа с каталогами переводов без внешнего gettext.

Django полагается на бинарники GNU gettext (`xgettext`, `msgfmt`), которых на
Windows обычно нет. Здесь минимальная замена, покрывающая ровно те способы
разметки строк, что используются в проекте: извлечение из исходников,
чтение и запись `.po`, компиляция `.mo`.

Если gettext в системе установлен, штатные `makemessages` и `compilemessages`
продолжают работать и дают тот же результат.
"""

from __future__ import annotations

import ast
import re
import struct
from dataclasses import dataclass, field
from pathlib import Path

# ─── Извлечение ──────────────────────────────────────────────────────────

# Python разбираем через ast, а не регулярками: соседние строковые литералы
# Python склеивает сам, и regex увидел бы только первый кусок —
# msgid получился бы обрезанным и никогда не совпал бы с рантаймом.
SIMPLE_CALLS = {"_", "gettext", "gettext_lazy", "gettext_noop", "ugettext", "ugettext_lazy"}
CONTEXT_CALLS = {"pgettext", "pgettext_lazy", "npgettext", "npgettext_lazy"}
PLURAL_CALLS = {"ngettext", "ngettext_lazy", "ungettext", "ungettext_lazy"}

# Шаблоны: {% translate "текст" %} / {% trans "текст" %}
TPL_SIMPLE = re.compile(
    r"""\{%\s*(?:translate|trans)\s+(?P<quote>["'])(?P<text>(?:\\.|(?!(?P=quote))[^\\])*)(?P=quote)""",
)
# {% blocktranslate %}…{% endblocktranslate %} — с необязательными with-аргументами
TPL_BLOCK = re.compile(
    r"\{%\s*blocktranslate(?P<args>[^%]*)%\}(?P<text>.*?)\{%\s*endblocktranslate\s*%\}",
    re.DOTALL,
)

SOURCE_DIRS = ("apps", "templates", "config")
SOURCE_SUFFIXES = {".py", ".html", ".txt"}
SKIP_PARTS = {"migrations", "__pycache__", ".venv", "node_modules"}


@dataclass(frozen=True)
class Entry:
    msgid: str
    context: str = ""
    locations: tuple[str, ...] = field(default=(), compare=False)

    @property
    def key(self) -> tuple[str, str]:
        return (self.context, self.msgid)


# Внутри blocktranslate Django заменяет {{ переменную }} на %(переменную)s —
# именно в таком виде msgid попадает в каталог. Без этой замены строки с
# подстановками не находили бы перевод во время работы.
BLOCK_VARIABLE = re.compile(r"\{\{\s*([\w.]+)\s*\}\}")


def _normalise_block(text: str) -> str:
    """
    Приводит тело blocktranslate к тому виду, в котором его видит Django:
    пробелы схлопываются, переменные превращаются в %(имя)s.
    """
    collapsed = " ".join(text.split())
    # Точки в пути к атрибуту Django не сохраняет — в msgid попадает
    # последний сегмент, ровно как в blocktranslate with.
    return BLOCK_VARIABLE.sub(lambda match: f"%({match.group(1).split('.')[-1]})s", collapsed)


def _call_name(node: ast.Call) -> str:
    func = node.func
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        return func.attr
    return ""


def _literal(node: ast.expr | None) -> str | None:
    return node.value if isinstance(node, ast.Constant) and isinstance(node.value, str) else None


def _extract_python(content: str, path: Path) -> list[tuple[str, str]]:
    """Возвращает список (контекст, msgid) из одного файла."""
    try:
        tree = ast.parse(content, filename=str(path))
    except SyntaxError:
        return []

    results: list[tuple[str, str]] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not node.args:
            continue

        name = _call_name(node)

        if name in SIMPLE_CALLS:
            text = _literal(node.args[0])
            if text:
                results.append(("", text))
        elif name in CONTEXT_CALLS and len(node.args) >= 2:
            context = _literal(node.args[0])
            text = _literal(node.args[1])
            if context is not None and text:
                results.append((context, text))
        elif name in PLURAL_CALLS and len(node.args) >= 2:
            # Единственное и множественное — две отдельные записи каталога.
            for argument in node.args[:2]:
                text = _literal(argument)
                if text:
                    results.append(("", text))

    return results


def extract(base_dir: Path) -> dict[tuple[str, str], Entry]:
    found: dict[tuple[str, str], Entry] = {}

    def add(msgid: str, context: str, location: str) -> None:
        if not msgid.strip():
            return
        key = (context, msgid)
        existing = found.get(key)
        locations = (existing.locations if existing else ()) + (location,)
        found[key] = Entry(msgid=msgid, context=context, locations=locations)

    for directory in SOURCE_DIRS:
        root = base_dir / directory
        if not root.exists():
            continue

        for path in sorted(root.rglob("*")):
            if path.suffix not in SOURCE_SUFFIXES:
                continue
            if SKIP_PARTS & set(path.parts):
                continue

            content = path.read_text(encoding="utf-8")
            relative = path.relative_to(base_dir).as_posix()

            if path.suffix == ".py":
                for context, text in _extract_python(content, path):
                    add(text, context, relative)
            else:
                for match in TPL_SIMPLE.finditer(content):
                    add(match.group("text"), "", relative)
                for match in TPL_BLOCK.finditer(content):
                    add(_normalise_block(match.group("text")), "", relative)

    return found


# ─── Чтение и запись .po ─────────────────────────────────────────────────


def _po_escape(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return escaped


def _po_unescape(value: str) -> str:
    return ast.literal_eval(f'"{value}"') if value else ""


def read_po(path: Path) -> dict[tuple[str, str], str]:
    """Возвращает {(контекст, msgid): msgstr}. Многострочные записи склеиваются."""
    if not path.exists():
        return {}

    catalog: dict[tuple[str, str], str] = {}
    context = msgid = msgstr = ""
    target: str | None = None

    def flush() -> None:
        nonlocal context, msgid, msgstr, target
        if target is not None and msgid:
            catalog[(context, msgid)] = msgstr
        context = msgid = msgstr = ""
        target = None

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()

        if not line or line.startswith("#"):
            if not line:
                flush()
            continue

        if line.startswith("msgctxt "):
            flush()
            context = _po_unescape(line[8:].strip().strip('"'))
            target = "msgctxt"
        elif line.startswith("msgid "):
            if target in {"msgstr", None}:
                flush()
            msgid = _po_unescape(line[6:].strip().strip('"'))
            target = "msgid"
        elif line.startswith("msgstr "):
            msgstr = _po_unescape(line[7:].strip().strip('"'))
            target = "msgstr"
        elif line.startswith('"'):
            chunk = _po_unescape(line.strip().strip('"'))
            if target == "msgid":
                msgid += chunk
            elif target == "msgstr":
                msgstr += chunk
            elif target == "msgctxt":
                context += chunk

    flush()
    catalog.pop(("", ""), None)
    return catalog


PO_HEADER = '''# Каталог переводов публичного сайта MyWay.
#
# Исходные строки — на русском: команда русскоязычная, и шаблоны должны
# читаться без словаря. Здесь переводится только английская версия.
#
# Синхронизация:  python manage.py i18n_sync
# Проверка:       python manage.py check_translations
# Компиляция:     python manage.py compile_translations
msgid ""
msgstr ""
"Project-Id-Version: myway-public-site 1.0\\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"

'''


def write_po(path: Path, entries: list[Entry], translations: dict[tuple[str, str], str]) -> int:
    """Пишет .po, сохраняя уже сделанные переводы. Возвращает число записей."""
    path.parent.mkdir(parents=True, exist_ok=True)

    lines = [PO_HEADER]
    for entry in sorted(entries, key=lambda item: (item.context, item.msgid)):
        for location in sorted(set(entry.locations)):
            lines.append(f"#: {location}\n")
        if entry.context:
            lines.append(f'msgctxt "{_po_escape(entry.context)}"\n')
        lines.append(f'msgid "{_po_escape(entry.msgid)}"\n')
        lines.append(f'msgstr "{_po_escape(translations.get(entry.key, ""))}"\n\n')

    path.write_text("".join(lines), encoding="utf-8")
    return len(entries)


# ─── Компиляция .mo ──────────────────────────────────────────────────────

# Разделитель контекста и msgid в бинарном каталоге gettext.
CONTEXT_GLUE = "\x04"


def compile_mo(po_path: Path, mo_path: Path) -> int:
    """
    Собирает .mo из .po без msgfmt.

    Формат простой: magic, счётчики, две таблицы смещений и блок строк.
    Описан в документации GNU gettext, раздел «MO Files».
    """
    catalog = read_po(po_path)
    # Пустые переводы в .mo не кладём: gettext вернул бы пустую строку
    # вместо исходной.
    items = {
        (f"{context}{CONTEXT_GLUE}{msgid}" if context else msgid): msgstr
        for (context, msgid), msgstr in catalog.items()
        if msgstr
    }

    # Заголовок обязателен: без него gettext не считает каталог валидным.
    items[""] = (
        "Project-Id-Version: myway-public-site 1.0\n"
        "MIME-Version: 1.0\n"
        "Content-Type: text/plain; charset=UTF-8\n"
        "Content-Transfer-Encoding: 8bit\n"
        "Plural-Forms: nplurals=2; plural=(n != 1);\n"
    )

    keys = sorted(items)
    ids = b""
    strs = b""
    key_offsets: list[tuple[int, int]] = []
    value_offsets: list[tuple[int, int]] = []

    for key in keys:
        encoded_key = key.encode("utf-8")
        encoded_value = items[key].encode("utf-8")
        key_offsets.append((len(encoded_key), len(ids)))
        value_offsets.append((len(encoded_value), len(strs)))
        ids += encoded_key + b"\x00"
        strs += encoded_value + b"\x00"

    count = len(keys)
    key_table_start = 7 * 4 + 16 * count
    value_table_start = key_table_start + len(ids)

    offsets = b""
    for length, offset in key_offsets:
        offsets += struct.pack("<II", length, offset + key_table_start)
    for length, offset in value_offsets:
        offsets += struct.pack("<II", length, offset + value_table_start)

    header = struct.pack(
        "<7I",
        0x950412DE,  # magic
        0,  # версия формата
        count,
        7 * 4,  # начало таблицы оригиналов
        7 * 4 + count * 8,  # начало таблицы переводов
        0,  # размер хеш-таблицы
        0,  # смещение хеш-таблицы
    )

    mo_path.parent.mkdir(parents=True, exist_ok=True)
    mo_path.write_bytes(header + offsets + ids + strs)
    return count - 1  # без служебного заголовка
