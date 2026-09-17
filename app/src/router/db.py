
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

from router.setting import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]