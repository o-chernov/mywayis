import hashlib
import secrets


def generate_refresh_token() -> str:
    """Непрозрачная случайная строка, а не JWT.

    Источник истины о сроке жизни и отзыве — строка в refresh_sessions, и в БД
    мы идём в любом случае. Подпись дала бы только лишние байты в куке и ложное
    ощущение, что срок задаётся токеном.
    """
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    """sha256 достаточно: токен случайный и высокоэнтропийный, перебирать
    нечего, а считается хеш на каждой ротации — медленный bcrypt тут мешал бы."""
    return hashlib.sha256(token.encode()).hexdigest()
