# Multi-agent visual direction

## Capability and evidence

The host runs the agents; ShotPilot supplies their briefs and coordination protocol. Discover actual delegation and image capabilities before work. Do not invent API names, simulated agents, or provider connections. Use the same portable protocol in any harness; available tools determine how it executes.

Maintain a small work record beside temporary working artifacts, separate from the canonical v1 JSON. Include the original request, hard constraints with IDs, reference accessibility and roles, execution mode, real agent IDs/tool outcomes, returned proposals, accepted/rejected suggestions with short reasons, final selection, validation output, review verdict, and generation/inspection outcome. Keep concise conclusions, not hidden reasoning. Do not store credentials or publish private reference paths.

Modes:
- `multi-agent`: all three specialist briefs and an independent final review completed through real delegation.
- `partial`: some delegated work succeeded; list failed/missing roles and inline replacements.
- `single-agent`: delegation unavailable or the user explicitly requested a direct/fast workflow; perform separately labeled proposal and review passes inline.

Respect host concurrency limits: run independent briefs in parallel when supported, otherwise run real agents sequentially. A timeout or failure permits one retry, then continue in partial/single-agent mode with the missing role stated. Report degradation briefly to the user. If the user requires independent agents as a hard condition, stop before generation when that condition cannot be met.

## Three independent briefs

Give each specialist the original request, the same immutable constraint checklist, reference roles and accessible images, output format, and known generator limitations. Do not give them each other's proposals. Ask for concise, concrete output; they must not generate images, call paid providers, or change files outside their assigned working artifacts.

1. **Composition director:** propose two distinct layouts within the user's constraints. Describe framing, focal hierarchy, subject placement, negative space, crop risks, and text regions. If the user fixed the layout, propose only permissible refinements; do not change it to manufacture alternatives.
2. **Visual treatment specialist:** propose two compatible treatments of light, palette, materials, or medium. Explain observable differences. Keep photographic details out of logos/diagrams unless requested. Fixed style/colors remain fixed.
3. **Fidelity specialist:** map every hard constraint to an explicit check; identify reference, identity, exact-text, count, anatomy, or editing risks. Suggest concrete wording to prevent failures. Mark unseen references as inaccessible instead of guessing their content.

Return: role, proposed choices, constraints preserved, risks, recommended choice, and short rationale. Multiple internal petitions are text/spec proposals, not multiple image renders.

## Synthesis

The main director compares proposals against intent fidelity first, then composition, medium consistency, reference/text feasibility, and unnecessary complexity. Use `quality-rubric.md` as guidance, not evidence that an image is good. Reject any proposal violating a hard constraint regardless of aesthetic appeal.

Choose one layout and one compatible treatment. Keep only relevant fidelity corrections. Record why alternatives were rejected; never concatenate all specialist prompts. Resolve conflicting suggestions using the user's priorities, not majority vote. Ask the user only if the original hard constraints themselves conflict and cannot be satisfied together.

Build the canonical JSON using `spec-schema.md` without adding coordination fields. Map every constraint ID to its final JSON location. Render the prompt if needed and check that reference bindings and exact text survive the conversion. The main director alone dispatches generation.

## Independent preflight

Commission a fresh verifier after synthesis. Give it the original request, checklist, accessible references with roles, final JSON and rendered prompt when applicable. Ask for PASS or blocking defects, each with the violated constraint, observable mismatch, and smallest correction. Do not prime the verifier with claims that the proposal is excellent.

Apply at most two repair passes, revalidate each changed JSON, and have the verifier check the revisions. Stop before generation if a blocking defect remains. A failed/unavailable verifier uses the explicitly recorded degraded path, never a fabricated PASS.

## Result inspection

After generation inspect the actual image, preferably with an independent visual reviewer when image access and delegation are available. Review subject count, identity/preserved regions, composition, exact text, colors/materials and artifacts against the original checklist. Return PASS, concrete defects, or UNVERIFIED for inaccessible aspects. Do not equate structural validation, an HTTP success, or a prompt review with visual success.

Correct only a concrete defect under the retry permissions in SKILL.md. After any permitted correction, inspect again. Report unresolved defects honestly. Default output remains one final image; additional render candidates need the user's requested count/budget.

## Evaluating improvement

Multi-agent direction is intended to improve fidelity and design choices; it does not guarantee better images. For a real comparison, use the same briefs, references, generator/settings and output count with the old single-spec workflow and the new workflow. Include a poster with exact text, a product/reference edit, a portrait and a diagram. Where supported hold seeds constant; otherwise repeat within an authorized budget. Have a reviewer blind to workflow score hard-constraint failures and visual criteria. Record latency and cost too. Until this comparison runs, describe visual improvement as unverified. Deterministic package tests cannot establish artistic superiority.
