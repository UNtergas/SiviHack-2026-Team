import { cn } from "@/lib/utils"
import type { Siglum as SiglumLetter } from "@/api/schema"

/**
 * A witness's mark. R collates against P; P is the base text and takes the
 * ink, which is why only R carries colour.
 */
export function Siglum({
  of,
  size = "sm",
  className,
}: {
  of: SiglumLetter
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center font-semibold leading-none select-none",
        of === "R"
          ? "bg-witness-r text-cloth-text"
          : "bg-witness-p text-cloth-text",
        size === "sm" && "size-[1.15em] text-[0.68em]",
        size === "md" && "size-6 text-[0.8rem]",
        size === "lg" && "size-9 text-base",
        className,
      )}
    >
      {of}
    </span>
  )
}
