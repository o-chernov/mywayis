import markdown as markdown_lib
from django import template
from django.urls import translate_url
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag(takes_context=True)
def alt_lang_url(context, language_code: str) -> str:
    """
    Адрес текущей страницы на другом языке.

    `translate_url` знает про i18n_patterns и сам подставляет или убирает
    префикс — руками резать путь нельзя, у русского префикса нет.
    """
    request = context.get("request")
    if request is None:
        return "/"
    return translate_url(request.get_full_path(), language_code)


@register.simple_tag(takes_context=True)
def nav_active(context, url_name: str, css_class: str = "nav__link--active") -> str:
    """Отдаёт класс, если сейчас открыт этот раздел."""
    request = context.get("request")
    match = getattr(request, "resolver_match", None)
    if match is None:
        return ""
    current = f"{match.namespace}:{match.url_name}" if match.namespace else match.url_name
    return css_class if current == url_name else ""


@register.simple_tag
def preview_bars() -> tuple[int, ...]:
    """
    Высоты столбиков в превью дашборда, в процентах.

    Значения зафиксированы, а не случайны: превью не должно меняться при
    каждой перезагрузке страницы.
    """
    return (52, 74, 38, 66, 81, 45, 22, 58, 70, 63, 88, 41, 55, 77, 34, 69)


@register.filter(name="markdown")
def markdown_filter(value: str) -> str:
    """
    Рендер юридических документов.

    Тексты пишет администратор в защищённой админке, поэтому HTML не вырезаем —
    иначе в документах нельзя было бы сделать таблицу реквизитов.
    """
    if not value:
        return ""
    html = markdown_lib.markdown(
        value,
        extensions=["extra", "sane_lists", "toc"],
        output_format="html",
    )
    return mark_safe(html)  # noqa: S308 — источник доверенный, см. docstring
