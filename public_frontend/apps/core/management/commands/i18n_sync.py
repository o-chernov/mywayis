from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.core.i18n_tools import extract, read_po, write_po


class Command(BaseCommand):
    help = (
        "Обновляет locale/en/LC_MESSAGES/django.po по исходникам. "
        "Уже сделанные переводы сохраняются, новые строки добавляются пустыми."
    )

    def handle(self, *args, **options) -> None:
        base_dir: Path = settings.BASE_DIR
        po_path = base_dir / "locale" / "en" / "LC_MESSAGES" / "django.po"

        entries = extract(base_dir)
        existing = read_po(po_path)

        # Считаем, что успело потеряться: строку удалили из кода, а перевод остался.
        obsolete = set(existing) - set(entries)
        added = set(entries) - set(existing)

        write_po(po_path, list(entries.values()), existing)

        self.stdout.write(f"Строк в исходниках: {len(entries)}")
        self.stdout.write(self.style.SUCCESS(f"Добавлено новых: {len(added)}"))
        if obsolete:
            self.stdout.write(
                self.style.WARNING(f"Удалено устаревших: {len(obsolete)}")
            )
        self.stdout.write(f"Файл: {po_path.relative_to(base_dir)}")
