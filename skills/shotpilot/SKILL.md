---
name: shotpilot
description: "Autonomous image-generation director for hosts with an image capability. Use whenever the user asks to create, generate, render, edit, transform, restyle, translate, repair, or improve an AI image or image prompt. Converts the user's request into a precise canonical JSON image spec, validates it, adapts it to the available host tool or webhook, and dispatches generation automatically so the user does not need to copy JSON or prompts. Handles references, identity preservation, products, people, photorealism, illustrations, posters, UI, text-in-image, aspect ratios, camera perspective, and negative constraints."
license: MIT
metadata:
  author: Roberto Manuel Jara Peche
  repository: ma-nucho-pro/shotpilot
---

# ShotPilot

Turn rough image intent into a validated production spec and send it to the image generator automatically when the host exposes one. The host context or manifest may help discovery, but this file remains the canonical workflow.

## Non-negotiable behavior

1. **Do not make the user copy JSON.** Build the JSON internally, validate it, then dispatch generation when an image tool/provider is available.
2. **Preserve intent before enriching.** Never replace the user's subject, exact text, identity, composition, style, colors, count, or edit invariants with your own taste.
3. **Do not invent visible details that contradict references.** If a reference image exists, treat it as ground truth for the requested preserved attributes.
4. **Ask only when a missing fact is outcome-critical.** Otherwise choose a sensible default and proceed.
5. **Generate one final image by default.** Do not spend on unrequested variants or retries through paid APIs.
6. **Use JSON as the internal contract.** If the image tool accepts structured input, pass it. If it only accepts text, render the validated JSON into a model-native prompt and send that.
7. **Do not expose the JSON unless the user asks for JSON, debug output, or a reusable spec file.** The normal output is the generated image/result.

## Autonomous pipeline

### 1. Classify

Determine:
- mode: `generate`, `edit`, `inpaint`, or `multi_reference`
- asset type: photo, portrait, product, poster, illustration, UI, diagram, character, architecture, etc.
- hard constraints: exact text, identities, logos, colors, layout, aspect ratio, count, elements that must remain unchanged
- references and each reference's role: identity, composition, style, product, environment, or edit target

If the user supplied a target image for an edit, verify that the runtime actually has access to that image before dispatching.

### 2. Develop internal proposals, then build the canonical JSON

Read `references/multi-agent.md`. When the host exposes real delegation, commission three independent specialist briefs (composition, visual treatment, and fidelity), wait for their outputs, and synthesize one coherent direction. Multiple internal proposals are the default; they do not authorize multiple image-generation calls. Record real delegation results and selection decisions in a separate work record, never in the canonical image JSON.

If delegation is unavailable or fails, follow the reference's explicit degraded workflow. Never claim that inline role passes are independent agents.

Read `references/spec-schema.md` and create a top-level JSON object that follows it. Do not wrap the object inside `prompt`, `superprompt`, or `request`.

Rules:
- Use concrete physical language instead of vague praise.
- Express spatial relationships explicitly.
- For photorealistic work, use plausible camera, lighting, material, skin, and environmental detail.
- For humans, include anatomy and hand constraints only when relevant; do not overload the prompt with anatomy jargon.
- For typography, preserve every user-supplied word exactly and define placement/hierarchy.
- For edits, place unchanged regions/features in `intent.must_preserve`.
- Put prohibitions in `negative_constraints`; do not let negatives contradict desired content.

### 3. Choose perspective only when it adds value

Scan `references/perspectives.md` if the request implies mood, tension, scale, motion, surveillance, introspection, macro detail, or unusual spatial storytelling. Otherwise keep standard eye-level or the user's stated angle.

Never add a perspective just to make the spec look sophisticated.

### 4. Add realism where the medium calls for it

For photorealistic images, read `references/realism.md` and add a small number of scene-appropriate realism anchors and imperfections. Avoid generic "8K masterpiece" filler.

Do not inject photographic imperfections into vector art, clean UI, diagrams, logos, or intentionally synthetic styles unless requested.

### 5. Validate before generation

Write the canonical spec to a temporary JSON file and run:

```bash
node "$SKILL_DIR/scripts/validate-spec.mjs" <spec.json>
```

Required result: `VALID` and score **>= 90**.

If validation fails:
1. fix only the reported gaps or contradictions;
2. validate again;
3. allow at most two repair passes; if validation still fails, stop before dispatch and report the unresolved errors. Do not call an invalid spec validated.

Validation is structural, not artistic. For complex/high-polish work, also perform a semantic check against the original request: every hard constraint must be represented once and no material new requirement may have been introduced.

### 6. Review the selected specification

Use a fresh verifier agent when delegation is available, following `references/multi-agent.md`. Give it the original request, accessible references and roles, final JSON, and hard-constraint checklist. Require a concise PASS or concrete blocking defects. Resolve defects and revalidate any changed JSON before dispatch. A numeric structural score cannot override a semantic failure. With no delegation, perform and label an inline review.

### 7. Dispatch automatically

Use this order:

**A. Host-native image generation tool — preferred**
- Inspect the runtime's available tools; do not invent a tool name.
- An image-generation tool exposed through the host's MCP integration counts as a host-native capability. Use it directly when available; do not invent or start an MCP server on the user's behalf.
- If the tool accepts structured JSON, pass the validated canonical object.
- If it accepts only prompt text, render the JSON with:

```bash
node "$SKILL_DIR/scripts/render-prompt.mjs" <spec.json>
```

Then call the image tool directly.
- Pass reference images through the tool's native reference/edit mechanism when supported.

**B. Configured JSON webhook**
If no native image tool exists and `SHOTPILOT_WEBHOOK_URL` is configured, send the canonical JSON using:

```bash
node "$SKILL_DIR/scripts/dispatch-webhook.mjs" <spec.json>
```

The webhook receives the exact JSON and can route it to n8n, Make, an MCP gateway, or a custom image service.

**C. No generator available**
Do not pretend generation happened. Save/return the validated JSON spec and the rendered prompt, and state that a compatible image-generation tool or webhook must be connected for automatic dispatch.

### 8. Post-generation quality check

If the runtime can inspect the generated image, compare only observable results against the hard constraints:
- subject/count/identity
- composition and crop
- exact text and spelling
- colors/materials
- requested preserved elements
- obvious anatomy/artifact failures

Read `references/multi-agent.md` for result evaluation and evidence recording. Pass the actual result to a visual reviewer only if the host can expose the image to that agent. Record unavailable inspection as unverified; do not infer visual success from a successful tool response.

If host-native generation supports a non-billable edit/retry path and one clear defect blocks success, make **one** targeted correction. For external paid APIs/webhooks, never auto-retry unless `SHOTPILOT_AUTO_RETRY=1` is explicitly configured.

## Reference-image rules

When references are present:
- identify each reference by role, never treat all references as identity references;
- preserve only what the user asked to preserve;
- for "keep everything else unchanged" edits, use a surgical edit instruction and keep the unchanged list explicit;
- never claim pixel-perfect identity preservation if the chosen generator cannot guarantee it;
- if the user asks to depict themselves and no usable personal reference is present, request one before generation.

## Output modes

Normal request:
- generate automatically;
- do not print the internal JSON;
- return the image/result and only minimal status text if the host requires it.

User asks for "JSON", "spec", "debug", or "archivo JSON":
- return/save the canonical JSON after it passes validation;
- optionally include the rendered provider prompt when useful.

User asks for "prompt only":
- still build + validate JSON internally;
- return only the rendered prompt.

## Read references progressively

- Canonical JSON fields → `references/spec-schema.md`
- Photorealism / anti-AI look → `references/realism.md`
- Perspective / camera storytelling → `references/perspectives.md`
- Model/tool selection principles → `references/routing.md`
- Quality criteria → `references/quality-rubric.md`
- Specialist briefs, synthesis, review, and degraded operation → `references/multi-agent.md`

Do not load all references unless the task genuinely needs them.
