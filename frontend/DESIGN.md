---
name: Proposal Scorer
description: A critical edition of the proposal, collated against the RFP — every judgment an apparatus entry keyed to the line that produced it.
colors:
  paper: "#fcfbf9"
  paper-inset: "#f3f1ea"
  ink: "#141210"
  ink-2: "#55504a"
  ink-3: "#6b645a"
  rule: "#c9c3b6"
  rule-hair: "#e4e0d7"
  witness-r: "#1b3a6b"
  witness-p: "#141210"
  cloth-ready: "#1a5632"
  cloth-fix: "#8a5a00"
  cloth-stop: "#9e1b32"
  cloth-text: "#fdfcf7"
  lemma: "#f7e6a8"
  lemma-edge: "#b8952c"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 6.4vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 78"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 78"
  numeral:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "'tnum' 1, 'lnum' 1"
  subhead:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 78"
  reading:
    fontFamily: "Brygada 1918, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  lemma:
    fontFamily: "Brygada 1918, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "normal"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.025em"
    fontVariation: "'wdth' 78"
  body:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  note:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  reference:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
    fontFeature: "'tnum' 1, 'lnum' 1"
  label:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.1em"
  caption:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.025em"
    fontFeature: "'tnum' 1, 'lnum' 1"
  micro:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  none: "0px"
spacing:
  hair: "2px"
  xs: "0.375rem"
  sm: "0.625rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "2rem"
  gutter-entry: "2rem"
  gutter-line: "2.75rem"
  measure: "112rem"
components:
  cloth-band:
    backgroundColor: "{colors.cloth-stop}"
    textColor: "{colors.cloth-text}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "1.75rem 2rem"
  button-primary:
    backgroundColor: "{colors.cloth-text}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  button-outline-cloth:
    backgroundColor: "transparent"
    textColor: "{colors.cloth-text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  button-outline-ink:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0"
  button-quiet-active:
    textColor: "{colors.ink}"
  siglum-r:
    backgroundColor: "{colors.witness-r}"
    textColor: "{colors.cloth-text}"
    rounded: "{rounded.none}"
    size: "1.15em"
  siglum-p:
    backgroundColor: "{colors.witness-p}"
    textColor: "{colors.cloth-text}"
    rounded: "{rounded.none}"
    size: "1.15em"
  citation-ref:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "0"
  citation-ref-live:
    textColor: "{colors.ink}"
  apparatus-entry:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.lemma}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0"
  witness-line-marked:
    backgroundColor: "{colors.lemma}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.none}"
  witness-header-r:
    backgroundColor: "{colors.witness-r}"
    textColor: "{colors.cloth-text}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1rem"
  witness-header-p:
    backgroundColor: "{colors.witness-p}"
    textColor: "{colors.cloth-text}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1rem"
  input-witness:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1rem"
  transcription-inset:
    backgroundColor: "{colors.paper-inset}"
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.none}"
    padding: "0.625rem 0.75rem"
---

# Design System: Proposal Scorer

## Overview

**Creative North Star: "The Critical Apparatus"**

This is the apparatus criticus of a scholarly edition, running as software. The draft proposal is the base text and carries the siglum **P**; the client's RFP is the collating witness **R**; every judgment the tool makes is an apparatus entry set as `lemma ] reading`, keyed by siglum and line number to the passage that produced it. Nothing is asserted without a mark pointing home. The page is an edition page: numbered lines in a strict gutter, hairline rules between entries, an editor's voice in condensed sans and a witness's voice in a serif, and no ornament that a printer would not have set.

The whole surface is built for two people at one screen. A salesperson and the senior colleague leaning in beside them point at citations with a finger, read a passage aloud and argue about whether a finding is fair, so every reference is a hit target with an underline under it and every quoted passage is set at full reading size rather than shrunk into a chip. Density is high but never small: the apparatus is tight, the reading text is not.

Two rejections are load-bearing and were argued for rather than inherited. The ground is true paper white (`#FCFBF9`), never cream — the cream-and-serif "serious document" page is this world's nearest neighbour and its explicit anti-reference. And severity carries no colour: it is printed abbreviation, weight and position, exactly as an apparatus has always done it. The only colour that means anything is the bookcloth band at the top of the page and one crimson word in the apparatus.

**Key Characteristics:**
- True paper white ground, never cream; ink is warm black, not grey-blue.
- Colour is spent on the verdict binding and the sigla — nowhere else.
- Rules and bands only: no cards, no shadows, `--radius` pinned to `0px`.
- Two faces on one rule: Brygada 1918 is the witnesses, Archivo is the editor.
- Every entry is numbered in a margin column, and every number is a link.
- One source line renders as exactly one line, because citations point at line numbers.

## Colors

A warm paper-and-ink neutral field, cut by exactly two kinds of colour: the bookcloth of the verdict binding and the bound sigla of the two witnesses.

### Primary
- **Bookcloth Green** (`#1A5632`): the verdict binding when the draft is ready to send. It colours the entire full-bleed band across the top of the review, not a dot or a badge.
- **Bookcloth Ochre** (`#8A5A00`): the binding for *fix before sending*.
- **Bookcloth Crimson** (`#9E1B32`): the binding for *not ready*. Outside the band it is spent exactly once in the whole apparatus — on a requirement the draft **contradicts** — and on the setup view's error rail.
- **Bookcloth Text** (`#FDFCF7`): the paper-warm white that prints on all three cloths, and the fill of the primary action button that sits on them.

### Secondary
- **Oxford Blue** (`#1B3A6B`): witness **R**, the collating RFP. It fills R's siglum square and R's pane header, and it is also the interactive accent the browser itself uses — focus ring, caret, `accent-color`. R is the only witness that carries colour, because **P** is the base text and takes the ink.

### Tertiary
- **Lemma Yellow** (`#F7E6A8`): the collation mark. It washes the full line in both witness panes when an entry is collated, and it is the text-selection colour, so a user's own highlight and the tool's mark are the same gesture. Also the ground of the staleness notice.
- **Lemma Edge** (`#B8952C`): the darker flash the mark passes through as it settles; a motion value, never a resting fill.

### Neutral
- **Paper** (`#FCFBF9`): the ground of every surface. True paper white.
- **Paper Inset** (`#F3F1EA`): the one recessed tone — transcription blocks (the suggested fix, the pending preview) and the ground of the weight-budget bar.
- **Ink** (`#141210`): body text, the base witness P, the setup masthead, must-fix emphasis.
- **Ink 2** (`#55504A`): secondary prose, the reading half of an apparatus entry, quiet controls at rest.
- **Ink 3** (`#6B645A`): line numbers, unnumbered metadata, the lemma bracket itself.
- **Rule** (`#C9C3B6`): the structural hairline — pane divisions, section tops, borders on outline controls.
- **Rule Hair** (`#E4E0D7`): the lighter hairline between entries in a list, so a run of entries reads as a column rather than a stack of boxes.

### Named Rules

**The Paper-Not-Cream Rule.** The ground is `#FCFBF9` and nothing warmer. Cream is the softest rendition of this world and the one it was built to refuse; a background that reads as ivory means the world has collapsed into a generic "serious document" page.

**The Colourless Severity Rule.** Severity is never a colour, a badge or a dot. *Must fix* is ink at bold, *should fix* is ink-2 at semibold, *optional* is ink-3 at medium, and the group heading states the level in words. The single exception in the apparatus is a `contradicted` requirement, which takes Bookcloth Crimson — one word on the page.

**The Binding Is The Light Rule.** The traffic light is the binding. Verdict colour arrives as a full-bleed band at page scale carrying the verdict in poster type; it is never reduced to a status pip, a ring or a coloured border.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, sans-serif) — the editor's voice
**Body Font:** Brygada 1918 (with Georgia, serif) — the witnesses' voice
**Label Font:** Archivo Variable, small, spaced and uppercase (`.editorial`)

**Character:** Two voices that never blur. Brygada 1918 is what the documents say — quoted source, lemmas, reading text, suggested wording — and it is set at full reading size with a real measure. Archivo is what the editor says about them — judgments, labels, numbers, chrome — and its width axis alone does the condensing: `.hand-condensed` sets `wdth 78`, and it is the only condensing mechanism in the build. There is no separate condensed family and none should be added.

### Hierarchy

The ramp is the build's, recorded step by step so a literal size in a new file can be checked against it. Everything above 1rem is the editor's Archivo except Reading and Lemma, which are the witnesses' Brygada.

- **Display** (Archivo 600 `wdth 78`, `clamp(2.1rem, 6.4vw, 6rem)`, line-height 0.9, `-0.035em`, uppercase): the verdict on the cloth band, running toward the right edge. One per page.
- **Headline** (Archivo 600 `wdth 78`, 2.25rem → 3rem at `sm`, line-height 0.92, `-0.035em`, uppercase): the product masthead on the setup view.
- **Numeral** (Archivo 600, **1.6rem below `sm`, 2rem from `sm` up**, line-height 1, tabular): the bound score in its plaque on the cloth band. One element at two breakpoints, not two sizes — treat the pair as a single step and move both together.
- **Subhead** (Archivo 600 `wdth 78`, 1.6rem, tight leading and tracking, uppercase): a full-page heading where there is no band to carry it — the run trace. Shares its size with the Numeral's small step by coincidence of scale, not by relation.
- **Reading** (Brygada 1918 400, 1.0625rem / line-height 1.6, `.prose-witness`): witness body text, quoted passages, suggested fix wording, and the paste textareas. Measure in the apparatus column is capped around 66–68ch.
- **Lemma** (Brygada 1918 400, 0.95–1rem, line-height ~1.375): the quoted lemma that opens every apparatus entry, before the bracket. Serif set within a few hundredths of a rem of Reading, because both are the witnesses speaking.
- **Title** (Archivo 600 `wdth 78`, 0.95rem, tracking `0.025em`, uppercase): witness pane headers and headings set inside a witness. Small caps-scale titles, deliberately not large.
- **Body** (Archivo 400, 0.95rem, line-height ~1.625, max 68ch): the editor's explanatory prose — why a finding matters, criterion weaknesses.
- **Body Small** (Archivo 400, 0.9rem): the same voice one step down — criterion names, panel summaries, the staleness banner, the setup masthead's description, trace step labels.
- **Note** (Archivo 400, 0.85rem): short standalone notices and the custom-criterion text inputs — the error rail, the trace's reassurance line, the setup masthead's action-adjacent copy.
- **Reference** (Archivo 600, 0.8rem, tabular): the numbers a reader looks up rather than reads — entry reference numerals, criterion weight percentages, the `/5` beside the score, the `md` siglum, the "no answering passage" fallback.
- **Label** (Archivo 600, 0.75rem, `0.1em`, uppercase, `.editorial`): every apparatus label, tab, action and section heading. This is the system's workhorse; most chrome is this one style.
- **Caption** (Archivo 600, 0.7rem, tracking `0.025em`): citation chips, witness pane subtitles, must-fix lede numerals.
- **Micro** (Archivo 600, 0.65rem, tabular): non-reading meta only — numerals set inside the weight-budget bar, its `0`/`100` scale ends, and the witness input's line/word count. Nothing a reader has to read at an angle belongs here.

**Body Small (0.9rem) and Note (0.85rem) sit one notch apart** and overlap in role; both shipped and both are recorded, but a new surface should reach for one of the two rather than invent a third size between them.

### Named Rules

**The Two Voices Rule.** Brygada speaks for the witnesses, Archivo for the editor. A quoted passage never appears in Archivo; a judgment, label or number never appears in Brygada.

**The Width-Axis Rule.** Condensing is `font-variation-settings: "wdth" 78` on Archivo (`.hand-condensed`). Never load or fake a condensed face, and never use `transform: scaleX`.

**The Micro-Is-Not-Reading Rule.** 0.65rem is for meta a reader glances at — a count, a scale end, a numeral inside a bar — never for anything two people lean in to read. The citation line number currently sits at this step and is the one use that does not meet the rule; it belongs at Caption (0.7rem) with the rest of the chip, and should be raised rather than copied.

**The Tabular Reference Rule.** Every number that is reference data — line numbers, scores, weights, entry refs — carries `data-numeric` and sets `tnum`/`lnum`, so numerals align in a column down the page.

## Layout

One page-wide container at `max-width: 112rem` with 1.25rem gutters, 2rem from the `sm` breakpoint up. The review is a full-height three-column edition at `xl` (`1.15fr 1fr 1fr`: apparatus, witness R, witness P), each column an independent scroll region with `min-h-0` so the page itself never scrolls; below `xl` the columns stack in that same reading order and the witnesses fall to `min-height: 22rem` each. The cloth band and the must-fix lede run full-bleed above the columns and are never inside a column.

Vertical rhythm is an edition's, not a dashboard's: entries are separated by `rule-hair` hairlines with `0.75rem`–`0.875rem` of padding each, list groups sit under an `.editorial` heading with a `rule` underline, and sections are separated by borders rather than gaps. Two fixed gutter columns carry the reference numbers: `2rem` for apparatus entry refs, `2.75rem` for witness line numbers. Wrapped source lines hang-indent `1.15em` (`.witness-line`) so a wrap never reads as a second numbered line. Above the fold the three must-fix entries sit uncollapsed on a three-up grid; nothing that matters most is behind a tab.

Action rows wrap as groups, not as loose buttons: the two draft-changing actions and the two triage actions are each wrapped in a `whitespace-nowrap` span with a hairline divider between them, so a narrow column breaks between the groups rather than through one.

## Elevation & Depth

**There are no shadows in this system.** Depth is carried entirely by ink weight, hairlines and one recessed tone. A surface is either paper (`#FCFBF9`), a recessed transcription inset (`#F3F1EA`), or a saturated band (bookcloth, siglum, pane header) — there is no third state and no lift. Elements are divided by 1px hairlines, never by a gap plus a shadow. The stylesheet declares no `box-shadow` at all, and none should be added: a hairline border is always the answer.

### Named Rules

**The No-Lift Rule.** Nothing casts a shadow, hovers off the page, or scales on hover. State is shown by colour weight (ink-2 → ink), by a hairline darkening (`rule` → `ink`), or by a ground wash — never by elevation.

## Shapes

Every corner is square. `--radius` is `0px` and all four Tailwind radius steps are pinned to `0px`, including for the borrowed shadcn primitives, so nothing rounds by accident. The form vocabulary is exactly three shapes: the **hairline rule** (1px `rule` or `rule-hair`, used to divide), the **band** (a full-bleed saturated block spanning its container — cloth band, pane header, masthead), and the **bound square** (the siglum: a 1:1 filled square with a single letter, and the score's `ink/20` plaque on the cloth).

Closed rectangles are rationed. The only bordered box in the system is the **transcription inset** — the suggested-fix block and the weight-budget bar — a square hairline border over `paper-inset` used to mark text that is *proposed but not yet part of a document*. A pending preview inside a witness is weaker still: a single left hairline, no box. Two closed containers were removed during review for breaking this (the verdict numeral's outline and the pending block's dashed box) and must not come back.

## Components

### Buttons
- **Shape:** square (0px), padding `0.75rem 1rem` (`0.5rem 0.75rem` for the small outline variant), always `.editorial` type.
- **Primary:** cloth-text fill on ink text, used once per band for the committing action (Run review, Re-run). Hover drops opacity to 0.85; disabled drops the fill to 45% and the text to 70%.
- **Outline on cloth:** transparent with a `cloth-text/40` hairline and `cloth-text/90` text; hover fills `cloth-text/12`.
- **Outline on paper:** transparent with a `rule` or `ink` hairline; hover inverts to ink fill with paper text.
- **Quiet (the apparatus action):** no border, no background, `.editorial` at ink-2 with a Lucide icon at `0.875rem`; hover and active state are simply ink. Every in-entry action is this variant.
- **Focus:** the global `:focus-visible` — a 2px Oxford Blue outline at 2px offset. Never removed, never restyled per component.

### Citation Reference (`R §4.4 17`)
The receipt on every judgment, and the system's most-used interactive element. A baseline-aligned inline row of three parts: the witness siglum square, the section label underlined in `rule` at 3px offset, and the line number in tabular ink-3. It is a button, not a link: it collates rather than navigates. Hover and live state darken the underline to ink and the text to ink; the live entry stays marked while its collation holds.

### Entry Reference Number
Every apparatus entry carries its number in the 2rem margin gutter, and the number is an `<a href="#e-iss-…">` to itself (`e-iss-*`, `e-req-*`, `e-crit-*`). It is underlined in `rule` so the affordance is visible; entries set `scroll-mt-28` so a deep link lands below the fixed band.

### Apparatus Entry (signature)
`lemma ] reading` — the mark that makes an entry an apparatus entry rather than a styled list row. Lemma in Brygada; a `0.42em`-padded ink-3 bracket; the reading in `.editorial`, weighted by severity or status. Below it, the citations; expanded, the quoted passage as a serif blockquote behind a left `rule` hairline, the editor's prose, the transcription inset carrying the suggested fix, and the action row. A settled entry strikes through its lemma and drops to ink-2.

### Cloth Band (signature)
Full-bleed, verdict-coloured, `transition-colors 500ms` when the verdict changes. The score is a bound numeral in an `ink/20` plaque at the far left, the verdict is display type running toward the right edge, and the actions sit flush right at cap height. The score steps through intervening tenths at 45ms a step when weights move, so a recompute is watched rather than inferred; under `prefers-reduced-motion` it returns the target during render with no animation at all.

### Witness Pane (signature)
A document set as a page. A saturated header in the witness's own colour (Oxford Blue for R, ink for P) carrying the siglum square, title and subtitle; then a `2.75rem` number gutter beside `.prose-witness` body. Numbers print every fifth line plus any currently marked line, exactly as an edition prints them. Markdown is *set, never shown*: headings become condensed uppercase, `**bold**` becomes bold in place, table rows become spaced cells, and one source line stays exactly one rendered line. A marked line takes the full-width lemma wash and its number goes ink/semibold. The pane is `tabIndex={0}` and keeps 45% trailing space so any line can centre.

### Inputs / Fields
- **Style:** the witness input is a bordered `rule` section with a coloured pane header, a full-bleed `.prose-witness` textarea on paper, and a hairline footer carrying the live line/word count and a Clear action. No inner radius, no inner shadow, `resize-none`.
- **Focus:** the textarea suppresses its own ring (the surrounding frame and caret carry it); the caret is Oxford Blue. Every other control uses the global focus ring.
- **Slider / Switch:** borrowed shadcn primitives, inheriting ink/rule through the mapped variables; the slider is capped at `16rem` so it reads as a control, not a bar chart.

### Navigation
A single hairline-bottomed tab row (Issues / Requirements / Criteria), `.editorial`, each with a tabular count at 60% opacity. The active tab is ink with a 2px ink bar sitting on the bottom hairline; the rest are ink-3 rising to ink-2 on hover. There is no sidebar, no second-level nav, and no route change anywhere in the product.

### Weight Budget Bar
A 2.25rem-tall flat bar on `paper-inset` divided into ink / ink-2 alternating segments sized by percentage, each showing its share when it exceeds 7%. Widths transition over 200ms so raising one weight is visibly taken from the others. It is the visible form of the rule that weights are shares of a fixed 100.

## Do's and Don'ts

### Do:
- **Do** keep the ground at true paper white (`#FCFBF9`) and put every surface on it.
- **Do** carry severity in weight, case and position — ink bold, ink-2 semibold, ink-3 medium — and name the level in words.
- **Do** put the verdict colour on a full-bleed band at page scale, with the score subordinate to it.
- **Do** set every quoted passage, lemma and suggested wording in Brygada 1918, and every judgment, label and number in Archivo.
- **Do** condense with Archivo's `wdth` axis (`.hand-condensed`, `wdth 78`).
- **Do** number every entry in the margin gutter and make the number a link to itself.
- **Do** attach a citation to every claim, and make it collate both witnesses at once rather than scroll one.
- **Do** divide with 1px hairlines (`rule` between regions, `rule-hair` between entries).
- **Do** mark numeric reference data with `data-numeric` so it sets tabular lining figures.
- **Do** keep one source line to one rendered line in a witness, hang-indenting wraps by `1.15em`.

### Don't:
- **Don't** warm the background toward cream or ivory; that is this world's anti-reference.
- **Don't** give severity a colour, a badge or a dot, and don't spend crimson anywhere but the verdict band, a `contradicted` requirement, and the error rail.
- **Don't** add a box-shadow, a hover lift, or a hover scale. Depth is ink weight, hairlines and one recessed tone.
- **Don't** round a corner. `--radius` is `0px`, including for borrowed shadcn primitives.
- **Don't** wrap content in a card. The only closed rectangle is the transcription inset for text proposed but not yet in a document; a preview inside a witness gets a left hairline instead.
- **Don't** add a condensed or display font family; Archivo's width axis is the only condensing mechanism.
- **Don't** shrink a quoted passage into a chip or a tooltip — two people are reading it aloud at an angle.
- **Don't** collapse must-fix entries behind a tab or an accordion above the fold.
- **Don't** replace the global focus ring (2px Oxford Blue, 2px offset) with a per-component treatment.
- **Don't** animate a collation as a glide. It is a step: `behavior: "auto"`, settled under 240ms, and suppressed entirely under `prefers-reduced-motion`.
