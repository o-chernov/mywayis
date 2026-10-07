from fastapi import APIRouter, Depends
from typing import Annotated
from app.core.db.database import AsyncSession, get_db
from app.features.registration.models.settings import RegistrationSettings
from sqlalchemy import select

router = APIRouter(
    prefix="/registration",
    tags=["registration"]
)


@router.get("/settings")
async def get_settings_registration(db: Annotated[AsyncSession, Depends(get_db)]):
    """
    Публичный эдпоинт - возвращает клиенту текущие состояние регистрации
    """
    statement = select(RegistrationSettings).where(
        RegistrationSettings.id == 1)
    settings_row = await db.scalar(statement)
    settings_row = await db.get(RegistrationSettings, 1)
