import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

type Health = { status: string }

/** Example query hook — replace with real endpoints. */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api<Health>("/health"),
  })
}
