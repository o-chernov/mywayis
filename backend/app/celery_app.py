from celery import Celery
from celery.schedules import crontab

from app.core.settings import settings

# Точка сборки воркера — то же, чем main.py является для API. Только здесь
# приложение знает обо всех слайсах сразу; сами слайсы друг о друге не знают.
celery_app = Celery("myway", broker=settings.RABBITMQ_URL)

celery_app.conf.update(
    # Результаты не храним: ни одна задача ничего не возвращает вызывающему,
    # а result backend — это ещё одно хранилище на поддержку.
    task_ignore_result=True,
    # Расписание считаем в UTC. Локальные пояса пользователей — дело слайсов,
    # инфраструктура живёт в одном времени.
    timezone="UTC",
    enable_utc=True,
    # Явный список вместо autodiscover_tasks: пакеты проекта namespace-овые
    # (без __init__.py), и автопоиск на них работает ненадёжно. Новый слайс со
    # своими задачами дописывается сюда — как роутер в main.py.
    include=[
        "app.core.ratelimit.tasks",
        "app.features.auth.tasks",
    ],
    beat_schedule={
        "purge-stale-rate-limit-counters": {
            "task": "ratelimit.purge_stale_counters",
            "schedule": crontab(minute=0),  # каждый час
        },
        "purge-expired-refresh-sessions": {
            "task": "auth.purge_expired_sessions",
            "schedule": crontab(hour=3, minute=30),  # раз в сутки, ночью
        },
    },
)
