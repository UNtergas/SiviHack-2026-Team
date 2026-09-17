import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const STACK = ["React 19", "Vite", "TypeScript", "Tailwind v4", "shadcn/ui", "TanStack Query"]

function App() {
  // Demo query against a public endpoint — swap for your own API.
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["demo"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/repos/TanStack/query")
      if (!res.ok) throw new Error("Request failed")
      return (await res.json()) as { full_name: string; stargazers_count: number }
    },
  })

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SiviHack 2026 — Frontend</CardTitle>
          <CardDescription>
            Stack is wired up and ready to build on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STACK.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">React Query smoke test</p>
            {isPending ? (
              <Skeleton className="h-5 w-48" />
            ) : isError ? (
              <p className="text-sm text-destructive">Failed to load.</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {data.full_name} — {data.stargazers_count.toLocaleString()} stars
              </p>
            )}
          </div>

          <Button onClick={() => refetch()} disabled={isFetching} className="w-full">
            {isFetching ? "Refetching…" : "Refetch"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default App
