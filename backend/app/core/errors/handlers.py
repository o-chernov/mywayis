import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.errors.base import AppError
from app.core.errors.common import InternalError, NotFound, ValidationFailed

logger = logging.getLogger(__name__)

# Коды для HTTPException, которые бросает сам Starlette (роутинг), — чтобы форма
# ответа была одна на все случаи и фронту не пришлось держать два парсера.
_HTTP_CODES = {
    404: NotFound.code,
    405: "METHOD_NOT_ALLOWED",
}


def _render(
    request: Request,
    *,
    code: str,
    status_code: int,
    params: dict[str, Any],
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "params": params,
                # getattr с дефолтом здесь намеренно: обработчик ошибок не имеет
                # права упасть сам, даже если RequestIdMiddleware отключили.
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


async def _app_error(request: Request, exc: AppError) -> JSONResponse:
    return _render(
        request,
        code=exc.code,
        status_code=exc.status_code,
        params=exc.params,
    )


async def _validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    # Отдаём машиночитаемый тип ошибки и путь до поля, но не английский текст
    # от pydantic: формулировку подставляет фронт по своему словарю.
    fields = [
        {
            "field": ".".join(str(part) for part in err["loc"][1:]),
            "type": err["type"],
        }
        for err in exc.errors()
    ]
    return _render(
        request,
        code=ValidationFailed.code,
        status_code=ValidationFailed.status_code,
        params={"fields": fields},
    )


async def _http_error(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    return _render(
        request,
        code=_HTTP_CODES.get(exc.status_code, "HTTP_ERROR"),
        status_code=exc.status_code,
        params={},
    )


async def _unhandled_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unhandled error on %s %s", request.method, request.url.path)
    # Текст исключения наружу не отдаём — он может содержать данные из БД.
    return _render(
        request,
        code=InternalError.code,
        status_code=InternalError.status_code,
        params={},
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _app_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(StarletteHTTPException, _http_error)
    app.add_exception_handler(Exception, _unhandled_error)
