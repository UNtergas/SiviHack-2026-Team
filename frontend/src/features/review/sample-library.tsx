import { useState } from "react"
import { Library, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { LIBRARY, SAMPLES, type SampleId } from "@/api/fixtures/documents"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * The real procurements, one entry per solicitation with its bids in the State's order.
 * Behind a button so the setup screen keeps the sponsor's four in front; choosing a bid
 * loads it and closes the dialog. The State's score lives in each bid's tooltip, never on
 * the button, so a demo does not announce the verdict.
 */
export function SampleLibrary({
  onSample,
  activeSample,
}: {
  onSample: (id: SampleId) => void
  activeSample: SampleId | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="editorial border-rule text-ink-2 hover:border-ink hover:text-ink inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 transition-colors"
        >
          <Library className="size-3.5" />
          More test data
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="border-ink bg-paper text-ink max-h-[85svh] w-[min(100%-2rem,52rem)] max-w-none gap-0 overflow-y-auto rounded-none border p-0 ring-0 sm:max-w-none"
      >
        <div className="border-rule flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <DialogTitle className="hand-condensed text-ink text-[1.6rem] leading-none font-semibold tracking-tight uppercase">
              Real procurements
            </DialogTitle>
            <DialogDescription className="text-ink-2 mt-1.5 max-w-[70ch] text-[0.9rem] leading-snug">
              Public bids from the State of Michigan&rsquo;s procurement site, split into the RFP and
              the bidder&rsquo;s own words. The State&rsquo;s evaluation is the answer key: hover a bid
              for its score. Each is a full run.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close"
            className="text-ink-2 hover:text-ink shrink-0 cursor-pointer p-1 transition-colors"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <ul aria-label="Solicitations">
          {LIBRARY.map((s) => (
            <li key={s.id} className="border-rule-hair border-b px-5 py-4 last:border-b-0">
              <p className="text-ink text-[0.95rem] leading-tight font-semibold">{s.title}</p>
              <p className="editorial text-ink-3 mt-1">{s.agency}</p>
              <p className="text-ink-2 mt-1.5 max-w-[70ch] text-[0.85rem] leading-snug">{s.description}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                {s.ids.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSample(id)
                      setOpen(false)
                    }}
                    aria-pressed={activeSample === id}
                    title={SAMPLES[id].note}
                    className={cn(
                      "editorial cursor-pointer border px-2.5 py-1.5 transition-colors",
                      activeSample === id
                        ? "border-ink bg-ink text-paper"
                        : "border-rule text-ink-2 hover:border-ink hover:text-ink",
                    )}
                  >
                    {SAMPLES[id].label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
