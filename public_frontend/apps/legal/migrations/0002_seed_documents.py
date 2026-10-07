"""
Первичное наполнение юридических документов.

Тексты берутся из apps/legal/initial_documents.py. Миграция идемпотентна:
существующие документы не перезаписываются, потому что после запуска их
правит юрист прямо в админке.
"""

from django.db import migrations

from apps.legal.initial_documents import DOCUMENTS


def seed(apps, schema_editor):
    LegalDocument = apps.get_model("legal", "LegalDocument")

    for data in DOCUMENTS:
        LegalDocument.objects.get_or_create(
            slug=data["slug"],
            jurisdiction=data["jurisdiction"],
            language=data["language"],
            defaults={key: value for key, value in data.items()
                      if key not in {"slug", "jurisdiction", "language"}},
        )


def unseed(apps, schema_editor):
    LegalDocument = apps.get_model("legal", "LegalDocument")

    for data in DOCUMENTS:
        LegalDocument.objects.filter(
            slug=data["slug"],
            jurisdiction=data["jurisdiction"],
            language=data["language"],
        ).delete()


class Migration(migrations.Migration):
    dependencies = [("legal", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
