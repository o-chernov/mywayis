from typing import Any, ClassVar


class AppError(Exception):
    """База для всех доменных ошибок приложения.

    Наследник объявляет code и status_code, а всё, что нужно фронту для
    подстановки в перевод, передаётся в конструктор:

        raise RateLimited(retry_after=45)

    Тот, кто бросает ошибку, ничего не знает про HTTP-ответ — в JSON её
    превращает обработчик в handlers.py.
    """

    code: ClassVar[str] = "INTERNAL_ERROR"
    status_code: ClassVar[int] = 500

    def __init__(self, **params: Any) -> None:
        self.params = params
        super().__init__(self.code)
