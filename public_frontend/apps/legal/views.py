from django.http import Http404
from django.utils.translation import gettext as _
from django.views.generic import TemplateView

from .selectors import active_jurisdiction, fill_placeholders, get_document, published_documents


class LegalIndexView(TemplateView):
    template_name = "legal/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["documents"] = published_documents()
        context["jurisdiction"] = active_jurisdiction()
        return context


class LegalDocumentView(TemplateView):
    template_name = "legal/document.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        document = get_document(kwargs["slug"])
        if document is None:
            # Документа нет в активной юрисдикции — например, ссылка на
            # оферту после переключения на США. Честнее 404, чем пустая страница.
            raise Http404(_("Документ не найден"))
        context["document"] = document
        # Реквизиты подставляются на рендере, а не хранятся в тексте:
        # поменялись — обновились сразу во всех документах.
        context["body"] = fill_placeholders(document.body)
        context["documents"] = published_documents()
        return context
