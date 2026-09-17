# SiviHack 2026 — Frontend

React + Vite + TypeScript, styled with Tailwind CSS v4 and shadcn/ui, with TanStack Query for server state.

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |

## Layout

```
src/
  components/ui/      shadcn/ui components (generated, editable)
  hooks/              React Query hooks (use-health.ts is the example)
  lib/
    api.ts            fetch wrapper, throws ApiError on non-2xx
    query-client.ts   shared QueryClient + defaults
    utils.ts          cn() class merger
  providers/
    query-provider.tsx  QueryClientProvider + devtools (dev only)
  App.tsx
  main.tsx
```

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Already installed: button, card, input, label, badge, skeleton, separator, sonner, dropdown-menu, dialog, avatar.

## Data fetching

Write one hook per endpoint in `src/hooks/`, using the `api()` helper:

```ts
export function useThings() {
  return useQuery({
    queryKey: ["things"],
    queryFn: () => api<Thing[]>("/things"),
  })
}
```

Query defaults (`src/lib/query-client.ts`): 1 min `staleTime`, 5 min `gcTime`, 1 retry, no refetch on window focus.

Imports use the `@/` alias for `src/`.
