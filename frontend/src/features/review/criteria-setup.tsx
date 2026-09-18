import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Criterion, WeightSuggestion } from "@/api/schema"
import { customId, isCustom, MAX_CUSTOM, rebalance, redistribute } from "@/lib/score"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export type SuggestState = "idle" | "pending" | "error" | "success"

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

/**
 * Weights are shares of a fixed 100 and they compete. Raising one takes from
 * the others on screen, so the budget is visible rather than implied.
 */
function BudgetRule({ criteria }: { criteria: Criterion[] }) {
  const enabled = criteria.filter((c) => c.enabled)

  return (
    <div className="mb-5">
      <div
        className="border-rule bg-paper-inset flex h-9 w-full border"
        role="img"
        aria-label={`Weight budget: ${enabled
          .map((c) => `${c.name} ${c.weight} per cent`)
          .join(", ")}`}
      >
        {enabled.map((c, i) => (
          <div
            key={c.id}
            style={{ width: `${c.weight}%` }}
            title={`${c.name} — ${c.weight}%`}
            className={cn(
              "relative grid min-w-0 place-items-center overflow-hidden transition-[width] duration-200 ease-out",
              i % 2 === 0 ? "bg-ink" : "bg-ink-2",
            )}
          >
            <span
              data-numeric
              className="text-cloth-text font-sans text-[0.65rem] font-semibold tabular-nums"
            >
              {c.weight >= 7 ? c.weight : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="text-ink-3 mt-1.5 flex justify-between font-sans text-[0.65rem]">
        <span>0</span>
        <span data-numeric>
          {enabled.length} of {criteria.length} criteria · 100 shared
        </span>
        <span>100</span>
      </div>
    </div>
  )
}

const NAME_MAX = 80
const CHECK_MAX = 400

/**
 * The reviewer's own criterion: a name and what to check. The backend scores it 1–5 in one
 * extra model call and cites the text like any other; the seven fixed criteria keep their
 * cache. Its id is a slug of the name, so the same criterion is a cache hit next time.
 */
function AddCriterion({
  criteria,
  onAdd,
  onCancel,
}: {
  criteria: Criterion[]
  onAdd: (c: Criterion) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [whatToCheck, setWhatToCheck] = useState("")
  const id = customId(name)
  const taken = name.trim() !== "" && criteria.some((c) => c.id === id)
  const ready = name.trim() !== "" && whatToCheck.trim() !== "" && !taken

  const submit = () => {
    if (!ready) return
    const enabled = criteria.filter((c) => c.enabled).length
    onAdd({
      id,
      name: name.trim(),
      whatToCheck: whatToCheck.trim(),
      enabled: true,
      weight: Math.round(100 / (enabled + 1)),
    })
  }

  return (
    <form
      aria-label="Add a custom criterion"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="border-rule mt-4 border p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="editorial text-ink-2 mb-1.5 block">Name</span>
          <input
            autoFocus
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="GDPR & data protection"
            className="border-rule bg-paper focus-visible:border-ink w-full border px-2.5 py-1.5 text-[0.85rem] focus-visible:outline-none"
          />
        </label>
        <label className="block">
          <span className="editorial text-ink-2 mb-1.5 block">What to check</span>
          <input
            value={whatToCheck}
            maxLength={CHECK_MAX}
            onChange={(e) => setWhatToCheck(e.target.value)}
            placeholder="Does it say where personal data is hosted and how it is protected?"
            className="border-rule bg-paper focus-visible:border-ink w-full border px-2.5 py-1.5 text-[0.85rem] focus-visible:outline-none"
          />
        </label>
      </div>
      <p className="text-ink-3 mt-2 text-[0.75rem] leading-snug">
        {taken
          ? "A criterion with this name is already listed."
          : "Scored 1–5 by the model in one extra call, with the passage that justifies it, like the rest."}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={!ready}
          className="editorial bg-ink text-paper hover:bg-ink-2 cursor-pointer px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add criterion
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="editorial text-ink-2 hover:text-ink cursor-pointer px-3 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

/** The seven criteria plus the reviewer's own: include or not, and how much each counts. */
export function CriteriaSetup({
  criteria,
  onChange,
  onSuggest,
  suggestions,
  suggestState,
  suggestError,
  extracted,
  rfpEmpty,
  disabled,
}: {
  criteria: Criterion[]
  onChange: (next: Criterion[]) => void
  onSuggest: () => void
  suggestions: WeightSuggestion[] | null
  suggestState: SuggestState
  suggestError: string | null
  /** What the model read from the RFP when it suggested the weights. */
  extracted: { requirements: number; constraints: number } | null
  rfpEmpty: boolean
  disabled?: boolean
}) {
  const reasonFor = (id: string) => suggestions?.find((s) => s.criterionId === id)?.reason ?? null
  const pending = suggestState === "pending"
  const [adding, setAdding] = useState(false)
  const customCount = criteria.filter(isCustom).length

  return (
    <div>
      <BudgetRule criteria={criteria} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSuggest}
          disabled={disabled || pending || rfpEmpty}
          className={cn(
            "editorial border-ink text-ink inline-flex items-center gap-2 border px-3 py-2",
            "hover:bg-ink hover:text-paper cursor-pointer transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Reading the RFP…" : "Suggest weights from the RFP"}
        </button>
        {rfpEmpty && <span className="text-ink-3 text-[0.78rem]">Paste the RFP first.</span>}
        {suggestState === "error" && (
          <p role="alert" aria-label="Weight suggestion failed" className="text-ink text-[0.85rem]">
            Could not read the RFP for weights: {suggestError}. The weights are unchanged.
          </p>
        )}
        {suggestState === "success" && extracted && (
          <p role="status" className="text-ink-2 max-w-prose text-[0.78rem]">
            Read from the RFP: {plural(extracted.requirements, "requirement")},{" "}
            {plural(extracted.constraints, "constraint")}. Each reason below cites the passage it
            came from.
          </p>
        )}
      </div>

      <ul className="border-rule border-t">
        {criteria.map((c) => {
          const reason = reasonFor(c.id)
          return (
            <li
              key={c.id}
              className={cn(
                "border-rule-hair grid gap-x-4 border-b py-3.5 sm:grid-cols-[1fr_13rem]",
                !c.enabled && "opacity-45",
              )}
            >
              <div className="min-w-0">
                <div className="flex items-start gap-2.5">
                  <Switch
                    checked={c.enabled}
                    disabled={disabled}
                    aria-label={`Include ${c.name}`}
                    onCheckedChange={(on) =>
                      onChange(
                        rebalance(criteria.map((x) => (x.id === c.id ? { ...x, enabled: on } : x))),
                      )
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-ink text-[0.9rem] leading-tight font-semibold">
                      {c.name}
                      {isCustom(c) && <span className="editorial text-ink-3 ml-2">custom</span>}
                    </h3>
                    <p className="text-ink-2 mt-0.5 max-w-[62ch] text-[0.78rem] leading-snug">
                      {c.whatToCheck}
                    </p>
                    {reason && (
                      <p className="text-ink-2 border-rule mt-1.5 max-w-[62ch] border-l pl-2 text-[0.75rem] leading-snug italic">
                        {reason}
                      </p>
                    )}
                  </div>
                  {isCustom(c) && (
                    <button
                      type="button"
                      aria-label={`Remove ${c.name}`}
                      disabled={disabled}
                      onClick={() => onChange(rebalance(criteria.filter((x) => x.id !== c.id)))}
                      className="text-ink-3 hover:text-ink ml-auto shrink-0 cursor-pointer transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-3 sm:mt-0.5">
                <Slider
                  value={[c.weight]}
                  min={0}
                  max={60}
                  step={1}
                  disabled={disabled || !c.enabled}
                  aria-label={`Weight for ${c.name}`}
                  onValueChange={([next]) => onChange(redistribute(criteria, c.id, next))}
                  className="min-w-0 flex-1"
                />
                <span
                  data-numeric
                  className="text-ink w-[3.25rem] shrink-0 text-right font-sans text-[0.8rem] font-semibold tabular-nums"
                >
                  {c.enabled ? `${c.weight}%` : "—"}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <AddCriterion
          criteria={criteria}
          onAdd={(c) => {
            onChange(rebalance([...criteria, c]))
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : customCount < MAX_CUSTOM ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setAdding(true)}
          className="editorial text-ink-2 hover:text-ink mt-4 inline-flex cursor-pointer items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          Add a custom criterion
        </button>
      ) : (
        <p className="text-ink-3 mt-4 text-[0.78rem]">Up to {MAX_CUSTOM} custom criteria per run.</p>
      )}
    </div>
  )
}
