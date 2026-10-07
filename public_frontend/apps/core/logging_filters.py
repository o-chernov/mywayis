import logging
import re

# Пароль приходит в форму и уходит в API открытым текстом (по HTTPS) и нигде
# не сохраняется. Но при отладке его легко утащить в лог вместе с телом запроса,
# поэтому вырезаем на уровне логгера — один раз и для всех обработчиков.
SECRET_PATTERNS = [
    re.compile(r'("(?:password|password2|api_key|token|secret)"\s*:\s*)"[^"]*"', re.IGNORECASE),
    re.compile(r"\b(password|password2|api_key|token|secret)=([^&\s]+)", re.IGNORECASE),
]

REDACTED = "***"


def scrub(text: str) -> str:
    result = text
    for pattern in SECRET_PATTERNS:
        if pattern.groups == 2 and "=" in pattern.pattern:
            result = pattern.sub(rf"\1={REDACTED}", result)
        else:
            result = pattern.sub(rf'\1"{REDACTED}"', result)
    return result


class ScrubSecretsFilter(logging.Filter):
    """Убирает пароли и токены из сообщений и аргументов записи."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = scrub(record.msg)

        if isinstance(record.args, dict):
            record.args = {
                key: (scrub(value) if isinstance(value, str) else value)
                for key, value in record.args.items()
            }
        elif isinstance(record.args, tuple):
            record.args = tuple(
                scrub(value) if isinstance(value, str) else value for value in record.args
            )

        return True
