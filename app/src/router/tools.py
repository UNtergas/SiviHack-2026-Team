
import httpx

from router.schema import Category
from router.setting import settings


def dispatch(category: Category, task: str) -> dict:
    """POST the task to the n8n workflow registered for this category."""
    url = f"{settings.N8N_BASE_URL}/webhook/{category.value}"
    try:
        r = httpx.post(url, json={"task": task}, timeout=30)
        if r.status_code == 404:
            return {"status": "no_workflow"}
        r.raise_for_status()
        return {"status": "ok", "result": r.json()}
    except httpx.RequestError as e:
        return {"status": "error", "detail": str(e)}
