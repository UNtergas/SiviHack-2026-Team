Supabase (Postgres + Auth, free)
   ↕ session pooler
FastAPI + SQLModel + uv          →  /openapi.json  →  openapi-typescript → React
                                 →  FastMCP        →  Claude / agents
                                 →  /openapi.json  →  n8n
Vite + React 19 + TanStack Router/Query
docker compose: api + web        (no db container — it's external now)
wrapped by a run.sh
