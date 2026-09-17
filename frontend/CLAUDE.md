## useEffect is a last resort

Most `useEffect` is a code smell. Before writing one, use the alternative:

| Instead of an effect that… | Do this |
|---|---|
| transforms data for rendering | compute during render, or `useMemo` |
| watches state to set other state | derive it — two sources of truth is the bug |
| runs a side effect of a user action | put it in the event handler |
| fetches on mount | `useQuery` |
| reacts to a query result | chain off the promise, or derive from `query.data` |
| does one-time imperative setup | `useRef` + a callback ref |

Legitimate uses, and essentially the only ones: subscribing to an external
system (SSE, WebSocket, IntersectionObserver, browser APIs), syncing with
non-React state that offers no callback, and cleanup on unmount.

## Conventions

- Every async view needs all four states: loading, empty, error, success.
- TanStack Query owns request/response; `useState` is for local UI only. `useQuery` gives the four states for free.
- Tailwind for styling. No CSS modules, no styled-components.