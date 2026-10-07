from app.core.errors.base import AppError

# Здесь живут только коды без слайса-владельца — те, что рождает сам фреймворк.
# Всё доменное объявляется в features/<слайс>/errors.py с префиксом слайса.


class InternalError(AppError):
    """Непредвиденная ошибка. Наружу не уходит ничего, кроме кода и request_id."""

    code = "INTERNAL_ERROR"
    status_code = 500


class ValidationFailed(AppError):
    """Тело или параметры запроса не прошли валидацию pydantic."""

    code = "VALIDATION_ERROR"
    status_code = 422


class NotFound(AppError):
    """Такого маршрута не существует.

    Для доменного «объекта нет» заводи код в своём слайсе
    (USERS_NOT_FOUND, TOURNAMENT_SEASON_NOT_FOUND) — фронту нужно понимать,
    чего именно не нашлось.
    """

    code = "NOT_FOUND"
    status_code = 404
