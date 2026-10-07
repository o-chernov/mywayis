import asyncio

import bcrypt

BCRYPT_ROUNDS = 12

# bcrypt использует только первые 72 байта пароля, а остальное молча
# отбрасывает (проверено на bcrypt 4.0.1 — исключения он не бросает).
# Ограничение именно в байтах: кириллица в UTF-8 занимает по два байта,
# то есть это всего ~36 символов.
MAX_PASSWORD_BYTES = 72

# Валидный хеш от строки, которой ни у кого нет. Нужен, чтобы ответ на вход с
# несуществующим email занимал столько же времени, сколько с существующим, —
# иначе база зарегистрированных адресов перебирается по времени ответа.
DUMMY_PASSWORD_HASH = "$2b$12$O0v8c0NQESJfjbuJwPdfMe.8li1csKK3NFxJ0p5ha5SPwcJctq.hy"


async def hash_password(password: str) -> str:
    """bcrypt считается сотни миллисекунд и блокирует event loop,
    поэтому уходит в отдельный поток."""
    encoded = password.encode()
    if len(encoded) > MAX_PASSWORD_BYTES:
        # Страховка: длину обязана отсекать схема на входе. Молча обрезать
        # нельзя — иначе подойдёт любой пароль с теми же 72 байтами в начале.
        raise ValueError(f"password exceeds {MAX_PASSWORD_BYTES} bytes")

    hashed = await asyncio.to_thread(
        bcrypt.hashpw, encoded, bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    )
    return hashed.decode()


async def verify_password(password: str, password_hash: str) -> bool:
    return await asyncio.to_thread(
        bcrypt.checkpw, password.encode(), password_hash.encode()
    )
