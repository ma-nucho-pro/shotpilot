<p align="center">
  <img src="https://i.ibb.co/vC1FphVh/Chat-GPT-Image-11-sept-2026-06-30-35-p-m.png" alt="ShotPilot logo" width="280" />
</p>

<p align="center">
  <strong style="font-size: 38px;">ShotPilot</strong><br/>
  <span style="font-size: 20px; color: #8b949e;">prompt in. image out.</span>
</p>

<p align="center">
  AI image generation Agent Skill for Codex, Claude Code, Cursor and Gemini CLI.
</p>

<table>
  <tr>
    <td width="50%" valign="top">
      <h2>Before</h2>
      <p>Long, messy prompts. Lots of back and forth.</p>
      <pre><code>Create a cinematic, professional, photorealistic
image of a modern workspace with a laptop on a
wooden desk, a coffee cup, a notebook, plants,
soft natural light coming from a window, shallow
depth of field, bokeh, warm tones, 8k, ultra
detailed, realistic lighting, film look, shot on
DSLR, 50mm, f/1.8, --ar 16:9 --style raw --v 6

Also make it look inspiring and minimal but cozy,
with no people, and add subtle brand vibes for an
AI productivity tool...</code></pre>
    </td>
    <td width="50%" valign="top">
      <h2>After</h2>
      <p>Simple, structured, great results.</p>
      <p><strong>🔵 1. Describe what you want</strong></p>
      <pre><code>shotpilot generate "modern workspace, laptop,
coffee, plants, cinematic, 16:9"</code></pre>
      <p><strong>🔵 2. Run the command</strong></p>
      <pre><code>shotpilot run</code></pre>
      <p><strong>🔵 3. Get your image</strong><br/>
      High-quality, production-ready image. No prompt engineering skills needed.</p>
    </td>
  </tr>
</table>

<p align="center">
  <a href="https://github.com/ma-nucho-pro/shotpilot/actions/workflows/ci.yml"><img src="https://github.com/ma-nucho-pro/shotpilot/actions/workflows/ci.yml/badge.svg" alt="tests" /></a>
  <img src="https://img.shields.io/badge/license-MIT-8fbf6a?style=for-the-badge" alt="license MIT" />
  <img src="https://img.shields.io/badge/runtime_dependencies-0-2ea043?style=for-the-badge" alt="zero runtime dependencies" />
  <img src="https://img.shields.io/badge/agent--native-yes-6f42c1?style=for-the-badge" alt="agent native" />
  <img src="https://img.shields.io/badge/JSON-validated-444444?style=for-the-badge" alt="validated JSON" />
  <img src="https://img.shields.io/badge/node-%E2%89%A518.17-0098FF?style=for-the-badge" alt="node 18.17+" />
</p>

<p align="center">
  <a href="#why">Why</a> •
  <a href="#what-it-does">What it does</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#install">Install</a> •
  <a href="#autonomous-dispatch">Dispatch</a> •
  <a href="#json-contract">JSON</a> •
  <a href="#author">Author</a>
</p>

---

```text
You:  make this look like a real iPhone photo, same person, same clothes,
      late-night convenience store, 4:5, keep the face unchanged

ShotPilot (internal)
  classify      edit + identity reference
  compile       canonical image JSON
  enrich        camera · lighting · spatial detail · realistic imperfections
  validate      96/100 ✓
  verify        hard constraints preserved ✓
  dispatch      native image tool → generated image

You receive: the image.
You did not copy a JSON blob into another model.
```

## Why

Most "image prompt" workflows stop at the least useful point: they hand you a longer prompt.

Then you copy it, switch tools, paste it into another model, discover that the framing changed, rewrite it, and repeat.

ShotPilot treats prompting as a **compiler + dispatch problem** instead:

```text
rough intent
    ↓
canonical visual spec (JSON)
    ↓
validation + semantic fidelity check
    ↓
model/tool adapter
    ↓
image generator
    ↓
observable QA
```

The JSON exists because visual intent needs structure. You normally never have to see it.

## What it does

### It turns vague prompts into a visual contract

ShotPilot captures the parts image models commonly lose:

- what the image is actually for;
- subject count and identity/reference roles;
- pose/action and spatial relationships;
- framing, angle, perspective and depth layers;
- physical lighting sources;
- camera/capture language when the medium is photographic;
- exact visible text;
- what must remain unchanged during edits;
- negative constraints tied to likely failure modes;
- aspect ratio, count, format and dispatch behavior.

### It validates before it generates

A deterministic validator checks the canonical spec. The default quality gate is **90/100**.

```bash
shotpilot validate examples/candid-cafe.json
```

```text
VALID
score: 100/100
```

The score does not pretend to judge art. It checks whether the agent actually specified enough to make the generation controllable. The agent separately checks semantic fidelity against your original request.

### It does not force "cinematic" on everything

A casual iPhone photo should stay casual. A product render should not inherit fake film grain. A clean UI should not get lens flare.

ShotPilot chooses perspective, imperfections, camera language and post-processing only when they serve the requested medium.

### It understands references by role

A reference can mean very different things:

| Role | What ShotPilot preserves |
|---|---|
| identity | the person's recognizable identity requested by the user |
| composition | framing, placement and camera relationship |
| style | visual treatment, not identity |
| product | shape, materials, branding and physical details |
| environment | place/background characteristics |
| edit target | the image being surgically changed |

That separation prevents the classic failure where a style reference accidentally changes the person or product.

### It keeps exact text exact

For posters, UI, memes, labels and ads, visible copy is stored separately in `text_rendering.exact_text`. The agent is told to preserve it character-for-character rather than paraphrase it into the visual description.

## How it works

The distributable skill lives in `skills/shotpilot/`.

```text
skills/shotpilot/
  SKILL.md
  references/
    spec-schema.md        canonical image JSON contract
    realism.md            anti-AI / photographic realism guidance
    perspectives.md       camera perspective selection
    routing.md            capability-based generator routing
    quality-rubric.md     semantic + structural quality bar
  scripts/
    validate-spec.mjs     deterministic 0–100 validator
    render-prompt.mjs     JSON → provider-friendly prompt
    dispatch-webhook.mjs  JSON → your image automation endpoint
```

The agent performs eight stages:

```text
1. classify
2. compile JSON
3. choose perspective when useful
4. add medium-appropriate realism/style detail
5. validate ≥ 90
6. optionally verify with a real subagent on complex work
7. dispatch automatically
8. inspect observable defects and make at most one allowed correction
```

## Autonomous dispatch

ShotPilot tries routes in this order.

### 1. Native image tool

If the host already exposes an image generation/editing tool, ShotPilot uses it directly. This is the preferred path because attached references stay inside the agent workflow.

If the tool accepts JSON, the canonical object is passed as structured input. If it expects text, ShotPilot renders the same validated JSON into a provider-friendly prompt first.

### 2. Your webhook

No native image tool? Point ShotPilot at an n8n, Make, MCP gateway, serverless function, or your own image service:

```bash
export SHOTPILOT_WEBHOOK_URL="https://your-endpoint.example/generate"
export SHOTPILOT_WEBHOOK_TOKEN="optional-bearer-token"

shotpilot send examples/candid-cafe.json
```

The webhook receives the canonical JSON as `application/json` unchanged.

This is the portable bridge that lets you connect **any** image model without changing the skill.

### 3. No generator connected

ShotPilot fails honestly. It leaves you with a validated JSON spec + rendered prompt instead of claiming an image was generated.

## JSON contract

A shortened example:

```json
{
  "version": "1.0",
  "mode": "generate",
  "intent": {
    "goal": "Believable casual phone photo, not a stock image",
    "asset_type": "photo",
    "must_preserve": [],
    "must_avoid": ["studio campaign look"]
  },
  "subjects": [
    {
      "id": "subject_1",
      "description": "young woman at a café",
      "pose_action": "mid-laugh turning to a friend"
    }
  ],
  "composition": {
    "framing": "waist-up",
    "camera_angle": "eye level",
    "perspective": "subtle stranger POV"
  },
  "lighting": {
    "sources": ["overcast window daylight", "warm pendant lights"]
  },
  "negative_constraints": ["plastic skin", "extra fingers", "watermark"],
  "output": {
    "aspect_ratio": "4:5",
    "count": 1,
    "format": "png"
  },
  "dispatch": {
    "preferred_adapter": "native",
    "auto_generate": true
  }
}
```

The complete schema is in [`skills/shotpilot/references/spec-schema.md`](skills/shotpilot/references/spec-schema.md).

## Install

### Option 1 — install the `.skill`

Use the packaged `shotpilot.skill` release file in any Agent Skills-compatible host that supports `.skill` imports.

### Option 2 — let your agent install the folder

Give Claude Code, Codex, Cursor or another skill-capable agent this repo and ask it to install:

```text
Install the ShotPilot skill from this repository.
Use skills/shotpilot as the skill source.
Copy it into the skill directory used by this agent without overwriting unrelated skills.
Run the bundled validator against examples/candid-cafe.json and show me the result.
Do not add credentials or configure a webhook unless I explicitly ask.
```

### Option 3 — use only the CLI utilities

```bash
git clone https://github.com/ma-nucho-pro/shotpilot.git
cd shotpilot
npm link
shotpilot validate examples/candid-cafe.json
shotpilot render examples/candid-cafe.json
```

Requires Node 18.17+. There are **zero runtime npm dependencies**.

## Commands

| Command | What it does |
|---|---|
| `shotpilot validate spec.json` | validate + score canonical JSON |
| `shotpilot render spec.json` | convert canonical JSON into a provider-friendly text prompt |
| `shotpilot send spec.json` | POST canonical JSON to `SHOTPILOT_WEBHOOK_URL` |
| `npm test` | run the local deterministic checks |

The CLI does not contain a second LLM. **The agent is the prompt compiler.** The CLI exists for deterministic validation and transport.

## Safety and secrets

ShotPilot does not require an account, database, daemon or telemetry service.

- The skill itself makes no network call unless dispatch reaches the configured webhook.
- `SHOTPILOT_WEBHOOK_TOKEN` is read only from the process environment and is never written by the tool.
- `.env` files are git-ignored.
- Do not commit API keys or webhook tokens.
- Paid-provider retries are off by default. Set `SHOTPILOT_AUTO_RETRY=1` only if you intentionally want automatic retries and your adapter honors it.

## Design principles

**Fidelity before decoration.** A prettier wrong image is still wrong.

**Structure before prose.** The JSON is the source of truth; the flattened prompt is an adapter output.

**Physical detail over hype words.** Light direction, fabric weave and actual camera position beat "masterpiece ultra quality".

**Progressive disclosure.** The main skill stays lean; model/medium-specific guidance lives in references and is loaded only when relevant.

**No copy/paste tax.** If the agent can generate, it generates.

## Repository layout

```text
shotpilot/
  README.md
  LICENSE
  package.json
  AGENTS.md
  CLAUDE.md
  bin/shotpilot.mjs
  examples/
  tests/
  skills/shotpilot/
  .github/workflows/ci.yml
```

## Verify it yourself

```bash
npm test
```

The included checks prove that:

- the example spec passes the quality gate;
- the validator rejects incomplete specs;
- the renderer keeps the objective and negative constraints;
- the project runs with Node's built-in modules only.

CI runs the suite on Linux, macOS and Windows across Node 18, 20 and 22.

## Author

**Roberto Manuel Jara Peche** — builder focused on AI systems, agents and practical generative-AI workflows. Creator of projects such as **Wife**, and the person behind **@ManuchoAI**.

<p>
  <a href="https://github.com/ma-nucho-pro"><img src="https://img.shields.io/badge/GitHub-ma--nucho--pro-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <a href="https://www.youtube.com/@ManuchoAI"><img src="https://img.shields.io/badge/YouTube-@ManuchoAI-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  <a href="https://x.com/ManuchoAI"><img src="https://img.shields.io/badge/X-@ManuchoAI-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
  <a href="https://www.instagram.com/robertmanuchojp/"><img src="https://img.shields.io/badge/Instagram-robertmanuchojp-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://www.linkedin.com/in/roberto-manuel-jara-peche-10867240b/"><img src="https://img.shields.io/badge/LinkedIn-Roberto%20Manuel%20Jara%20Peche-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
</p>

If ShotPilot improves your generations, a ⭐ helps other builders find it.

## License

MIT © 2026 Roberto Manuel Jara Peche — see [LICENSE](LICENSE).
