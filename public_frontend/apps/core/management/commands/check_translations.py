from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.core.i18n_tools import extract, read_po


class Command(BaseCommand):
    help = (
        "Проверяет, что каждая строка из исходников переведена на английский. "
        "Аналог npm run i18n:check в личном кабинете."
    )

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--limit",
            type=int,
            default=20,
            help="Сколько непереведённых строк показать (по умолчанию 20).",
        )

    def handle(self, *args, **options) -> None:
        base_dir: Path = settings.BASE_DIR
        po_path = base_dir / "locale" / "en" / "LC_MESSAGES" / "django.po"

        entries = extract(base_dir)
        catalog = read_po(po_path)

        missing = [entry for key, entry in entries.items() if not catalog.get(key)]

        if not missing:
            self.stdout.write(
                self.style.SUCCESS(f"Все строки переведены: {len(entries)} записей.")
            )
            return

        limit = options["limit"]
        self.stdout.write(self.style.ERROR(f"Без перевода: {len(missing)} из {len(entries)}"))
        for entry in sorted(missing, key=lambda item: item.msgid)[:limit]:
            location = entry.locations[0] if entry.locations else "?"
            preview = entry.msgid if len(entry.msgid) <= 70 else entry.msgid[:67] + "…"
            self.stdout.write(f"  {location}: {preview}")
        if len(missing) > limit:
            self.stdout.write(f"  … и ещё {len(missing) - limit}")

        raise CommandError("Каталог переводов неполон. Запустите i18n_sync и заполните msgstr.")
