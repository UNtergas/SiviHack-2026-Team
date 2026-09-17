/**
 * What the backend returns from `POST /score` — the loose contract in
 * `app/schema.d.ts`. The backend may add fields; unknown ones are ignored.
 * Only `adapt.ts` reads these; the rest of the app speaks `schema.ts`.
 */

export type CoverageStatus = "ADDRESSED" | "PARTIAL" | "MISSING" | "CONTRADICTED"
export type RiskSeverity = "HIGH" | "MEDIUM" | "LOW"
export type RiskType =
  | "OVERCOMMIT"
  | "SCOPE_CREEP"
  | "UNREALISTIC_TIMELINE"
  | "PRICING_MISMATCH"
  | "CONTRADICTION"

export interface BackendRequirement {
  id: string
  label: string
  rfpQuote: string
  section?: string | null
  grounded?: boolean
}

export interface CoverageItem {
  requirementId: string
  status: CoverageStatus
  proposalQuote?: string | null
  explanation: string
  fix: string
  grounded?: boolean
}

export interface BackendScore {
  id: string
  label: string
  score: number
  rationale: string
  evidenceQuote?: string | null
  source?: "proposal" | "rfp" | null
  grounded?: boolean
}

export interface RiskFinding {
  type: RiskType | string
  proposalQuote: string
  rfpQuote?: string | null
  explanation: string
  severity: RiskSeverity
  fix?: string
  grounded?: boolean
}

export interface ScoringResult {
  overall: number
  weights: Record<string, number>
  scores: BackendScore[]
  coverage: CoverageItem[]
  risks: RiskFinding[]
  requirements: BackendRequirement[]
  meta?: {
    model?: string
    temperature?: number
    durationMs?: number
    ungroundedDropped?: number
    cacheHit?: boolean
  }
}
