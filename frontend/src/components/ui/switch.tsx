"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

/**
 * A square switch, in the system's ink and paper: no rounded pill, no coloured
 * accent. On is an ink track with a paper thumb; off is the recessed paper
 * tone with an ink-3 thumb. The thumb slides its own width.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-none border p-px outline-none transition-colors",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
        "data-checked:border-ink data-checked:bg-ink data-unchecked:border-rule data-unchecked:bg-paper-inset",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-none transition-transform data-checked:translate-x-full data-checked:bg-paper data-unchecked:translate-x-0 data-unchecked:bg-ink-3"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
