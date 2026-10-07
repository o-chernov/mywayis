from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.core.i18n_tools import compile_mo


class Command(BaseCommand):
    help = (
        "Собирает .mo из .po без внешнего msgfmt. "
        "Замена compilemessages на машинах без GNU gettext."
    )

    def handle(self, *args, **options) -> None:
        base_dir: Path = settings.BASE_DIR
        locale_dir = base_dir / "locale"

        if not locale_dir.exists():
            self.stdout.write(self.style.WARNING("Каталог locale/ не найден."))
            return

        for po_path in sorted(locale_dir.rglob("*.po")):
            mo_path = po_path.with_suffix(".mo")
            count = compile_mo(po_path, mo_path)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{po_path.relative_to(base_dir)} → {mo_path.name}: {count} строк"
                )
            )
