import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-Id"


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Выдаёт каждому запросу идентификатор.

    Он уходит и в заголовок ответа, и в тело ошибки — по нему в поддержке
    находится конкретный запрос в логах. Значение всегда генерируется на
    сервере: заголовок от клиента принимать нельзя, иначе логи можно засорить
    произвольными строками.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = uuid.uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
