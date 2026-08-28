# Headset Cue Check — visual thesis

## Direction: the listener's botanical field guide

This product treats headset setup as careful observation rather than a pass/fail lab test. The interface borrows the useful qualities of a working field guide: warm specimen paper, numbered observations, margin notes, fine rules, a single identifying illustration, and language that asks the listener what they noticed. It should feel calm and trustworthy in an accessibility lab, but personal enough to use at a kitchen table. It must never resemble a diagnostics dashboard or make medical claims.

The phone version becomes a single-column pocket guide: the decorative specimen index disappears, actions remain full-width and ≥44 px, and the current observation stays before all supporting notes.

## Palette

All colors are CSS tokens with light and dark treatments.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| paper / background | `#F4F0E5` | `#17201B` | page, like uncoated stock |
| surface | `#FFFCF3` | `#202B24` | observation sheets |
| ink / text | `#17251C` | `#F4F0E5` | primary copy |
| muted | `#536057` | `#B8C3B9` | secondary copy (≥4.5:1) |
| fern / accent | `#1F5C42` | `#8BC9A4` | primary actions and focus |
| accent contrast | `#FFFFFF` | `#102018` | text on accent |
| rust | `#9A3F25` | `#F0A185` | warnings, annotations |
| success | `#2E6945` | `#9AD1AC` | completed observations |
| danger | `#9B2E2E` | `#FFAAA3` | errors only |
| rule | `#BBC2B7` | `#56655A` | dividers and control outlines |

Color never carries a state alone: status always includes text and/or a symbol. The light paper is explicitly painted and dark mode follows the device preference. Primary body/accent combinations are selected for WCAG AA contrast.

## Typography

- Observation/display: Georgia, `Times New Roman`, serif. Familiar field-guide authority without a downloaded font.
- Interface: ui-sans-serif, system-ui, `Segoe UI`, sans-serif. Clear controls and numerals with zero runtime font cost.
- Scale: 0.875, 1, 1.125, 1.375, clamp(1.65–2.35), clamp(2.25–4) rem; body is never below 16 px. Reading measure is 68 characters. Numeric progress uses tabular figures.

## Spacing and shape

The base rhythm is 4 px; primary gaps use 8, 12, 16, 24, 32, 48, and 72 px. Corners are clipped rather than pill-shaped: 2 px for paper panels, 6 px for controls. Fine 1 px rules and small botanical markers create structure only where grouping by proximity is insufficient. Buttons and inputs are at least 48 px high.

## Interaction grammar

- The test is a linear set of six labelled observations. Each opens in place like moving to the next page of a field notebook.
- “Play cue” is always the strongest action; rating choices look like labelled specimen tabs and use native radio inputs.
- Every audio event has visible text and an assertive status update; no cue is identifiable by sound alone.
- Listeners may pause and resume. Back never destroys answers. Reset requires a specific confirmation and offers an immediate undo.
- Keyboard shortcuts are additive: Space plays/stops when focus is not in a form control, Left/Right move through completed/current steps. All functions remain standard controls.
- Audio failures offer a useful next step: check browser site audio, device output, and retry. The user can continue and mark a cue “Could not assess.”

## Motion policy

Only state changes move. A new observation fades and rises 8 px over 180 ms; progress width changes over 220 ms; button pressure moves 1 px. Audio indicators do not loop. Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant and the design relies on contrast, rules, and labels for depth.

## Asset plan and art direction

One original hero illustration is used above the start action and nowhere as filler. It is a wide, tactile editorial still life: over-ear headphones arranged like a pressed botanical specimen, two ginkgo-like leaves indicating left/right, a small tuning fork and field-note marks, on warm fiber paper. It clarifies that the product combines headset listening with deliberate observation. The image contains no people, UI, brands, labels, text, medical equipment, or hearing-test imagery.

Prompt sheet:

- **Use case:** stylized-concept, landing-page hero illustration.
- **Subject:** one unbranded over-ear headset laid open like a botanical specimen; two distinct leaves near the ear cups; a slender tuning fork and a few hand-drawn nonverbal registration marks.
- **World/materials:** archival field guide, pressed leaves, graphite, faded gouache, warm fibrous paper, tactile print grain.
- **Light/lens:** soft window light from upper left, shallow relief shadows, straight-on 50 mm editorial composition.
- **Palette words:** oat paper, deep fern ink, sage, oxidized copper, charcoal.
- **Composition:** landscape 3:2, subject on right two-thirds, quiet negative space on upper-left; coherent edges for responsive crop.
- **Negative list:** no text, letters, numbers, watermark, logos, people, ears, faces, clinical diagrams, audiograms, neon gradients, glossy 3D, extra headphone parts, malformed cables.

Generated asset provenance: `assets/src/headset-specimen.png`, generated on 2026-08-28 with the Param Factory Azure image deployment (`factory-image`) using `/opt/fleet/lib/gen-image.sh`; original to this product under the project MIT license. The final prompt is stored beside the source as `assets/src/headset-specimen.prompt.json`. The public WebP derivative is reviewed for artifacts and optimized to ≤300 KB. The footer discloses AI-assisted generated imagery.

All other marks (leaf bullets, audio-channel diagram, app icons) are original code-authored SVG/CSS geometry so they remain sharp, small, and accessible.
