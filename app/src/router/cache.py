import hashlib
from typing import Any

from sqlmodel import Session, select

from router.models_db import CachedResult
from router.schema import Classification
from router.setting import settings


def task_key(task: str) -> str:
    norm = task.strip().lower()
    return hashlib.sha256(f"{settings.PROMPT_VERSION}:{norm}".encode()).hexdigest()


def get_cached(session: Session, key: str) -> CachedResult | None:
    return session.exec(
        select(CachedResult).where(CachedResult.task_hash == key)
    ).first()


def store(
    session: Session,
    key: str,
    task: str,
    classification: Classification,
    action: dict[str, Any],
) -> CachedResult:
    row = CachedResult(
        task_hash=key,
        task=task,
        category=classification.category.value,
        classification=classification.model_dump(mode="json"),   # enum → string, JSON-safe
        action_result=action,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row