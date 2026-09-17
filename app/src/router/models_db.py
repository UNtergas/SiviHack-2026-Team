from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

class CachedResult(SQLModel, table=True):
    __tablename__:str = "cached_results"

    id: int | None = Field(default=None, primary_key=True)
    task_hash: str = Field(index=True, unique=True)     # sha256(prompt_version + task)
    task: str
    category: str                                        # denormalised for easy querying
    classification: dict[str, Any] = Field(sa_column=Column(JSON))   # the Classification
    action_result: dict[str, Any] = Field(sa_column=Column(JSON))    # the n8n output
    source: str = "live"                                 # how it was originally produced
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


