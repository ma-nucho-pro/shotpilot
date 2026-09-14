<p align="center">
  <img src="https://i.ibb.co/vC1FphVh/Chat-GPT-Image-11-sept-2026-06-30-35-p-m.png" alt="ShotPilot logo" width="240" />
</p>

<h1 align="center">ShotPilot</h1>

<p align="center">
  <strong>prompt in. image out.</strong><br />
  An agent-native image generation skill that turns rough image requests into structured, validated visual specifications and routes them to an available image-generation capability.
</p>

<p align="center">
  <a href="https://github.com/ma-nucho-pro/shotpilot/actions/workflows/ci.yml"><img src="https://github.com/ma-nucho-pro/shotpilot/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-8fbf6a?style=for-the-badge" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A518.17-0098FF?style=for-the-badge" alt="Node.js 18.17 or newer" />
  <img src="https://img.shields.io/badge/runtime_dependencies-0-2ea043?style=for-the-badge" alt="zero runtime dependencies" />
  <img src="https://img.shields.io/badge/Agent_Skills-SKILL.md-6f42c1?style=for-the-badge" alt="Agent Skills format" />
</p>

<p align="center">
  <a href="#why-shotpilot">Why</a> ·
  <a href="#what-it-does">What it does</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#install-the-skill">Install</a> ·
  <a href="#harness-support">Harnesses</a> ·
  <a href="#image-backends">Backends</a> ·
  <a href="#examples">Examples</a> ·
  <a href="#faq">FAQ</a>
</p>

~~~text
rough request → ShotPilot → validated visual contract → available generator → image
~~~

ShotPilot is the orchestration layer. The host agent or a configured webhook must provide the capability that renders the pixels.

## Why ShotPilot

Most prompt workflows turn:

~~~text
short request → longer prompt → copy/paste → tweak → repeat
~~~

ShotPilot treats the problem as visual-intent compilation instead. It preserves what the user actually asked for, adds camera or lighting detail only when useful, validates the result, and routes the request without making the user move JSON or prompts between tools.

| Without ShotPilot | With ShotPilot |
| --- | --- |
| “Cinematic, professional, realistic, 8K, DSLR…” | “Create a believable late-night iPhone photo. Keep this person. 4:5.” |
| Manual prompt engineering and repeated edits | Intent classification and a canonical visual contract |
| Copy/paste between the agent and an image model | One validated request handed to the available generation capability |

## What it does

ShotPilot is not simply <code>short prompt → longer prompt</code>. Its skill defines a pipeline for an agent:

1. Understand the user’s visual intent and hard constraints.
2. Classify reference images by role.
3. Commission independent composition, visual-treatment, and fidelity briefs through real host subagents, then compare and synthesize them into one canonical JSON specification.
4. Add medium-appropriate camera, lighting, composition, and realism detail only when it helps.
5. Run deterministic validation and require a score of at least 90/100 before dispatch.
6. Route the validated contract to a host-native image tool or a configured JSON webhook.
7. If no generator is available, return the validated spec and rendered prompt instead of claiming that an image was created.

### Multi-agent direction

When the harness exposes delegation, ShotPilot requests three specialist briefs, compares internal alternatives, and gives the selected specification to a fresh verifier before generation. The director resolves conflicting suggestions and preserves the user's fixed constraints. Multiple internal proposals still lead to one final image by default.

The host must supply real subagent tools. With missing or failed delegation, the skill reports `single-agent` or `partial` execution and performs the missing passes inline; it never presents those passes as independent agents. Coordination evidence stays in a separate work record, preserving the canonical v1 image contract. See [the full protocol](skills/shotpilot/references/multi-agent.md).

Structural validation and a semantic preflight are required before dispatch. The webhook command also enforces validation before any network request. Generated images are inspected when the host exposes them; inaccessible visual results remain unverified. Better image quality is an objective, not a measured guarantee: a controlled visual comparison is still needed.

### Reference images are not interchangeable

The schema gives each reference an explicit role:

| Role | Meaning |
| --- | --- |
| <code>identity</code> | Preserve a person’s recognizable identity when requested. |
| <code>composition</code> | Preserve framing, placement, or camera relationships. |
| <code>style</code> | Borrow visual treatment without changing identity or structure. |
| <code>product</code> | Preserve a product’s shape, materials, branding, and physical details. |
| <code>environment</code> | Preserve a place or background context. |
| <code>edit_target</code> | Identify the image being changed in an edit or inpaint operation. |

For edits, unchanged requirements belong in <code>intent.must_preserve</code>; prohibited outcomes belong in <code>intent.must_avoid</code> or the top-level <code>negative_constraints</code>. The skill does not claim pixel-perfect identity preservation when the selected generator cannot guarantee it.

## Quick start

The repository’s executable surface is intentionally small and dependency-free:

~~~bash
git clone https://github.com/ma-nucho-pro/shotpilot.git
cd shotpilot

npm test

node bin/shotpilot.mjs validate examples/candid-cafe.json
node bin/shotpilot.mjs render examples/candid-cafe.json
~~~

The example currently validates as:

~~~text
VALID
score: 100/100
~~~

To make the CLI available as <code>shotpilot</code> on your machine, optionally run:

~~~bash
npm link
shotpilot validate examples/candid-cafe.json
~~~

<code>npm link</code> installs a local command link; it does not install an image provider.

## Install the skill

The distributable Agent Skill is the directory:

~~~text
skills/shotpilot/
├── SKILL.md
├── agents/
├── references/
└── scripts/
~~~

Register or copy that directory into the skill location supported by your agent. The discovered file must remain at:

~~~text
<agent-skill-root>/shotpilot/SKILL.md
~~~

Keep <code>references/</code> and <code>scripts/</code> beside <code>SKILL.md</code>; the skill loads them progressively when needed.

This repository ships a dependency-free installer at <code>scripts/install.mjs</code>, Codex UI metadata at <code>skills/shotpilot/agents/openai.yaml</code>, and a Gemini CLI context/extension pair at <code>GEMINI.md</code> and <code>gemini-extension.json</code>. These files only distribute and expose the same portable skill; they do not add provider credentials, replace native host tools, or bundle an image model.

For a local user-scoped install, choose one target:

~~~bash
node scripts/install.mjs claude
node scripts/install.mjs codex
node scripts/install.mjs cursor
node scripts/install.mjs gemini
node scripts/install.mjs agents
~~~

To install the skill in every supported user location, run <code>node scripts/install.mjs all</code>. Existing ShotPilot destinations are protected; use <code>--force</code> only when you intentionally want to update an existing ShotPilot copy. Use <code>--dry-run</code> to inspect destinations without writing files.

### Install with Claude Code

Use Claude Code’s Agent Skills discovery mechanism and register <code>skills/shotpilot/</code>. Anthropic’s [Agent Skills overview](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) explains the portable directory format. If your Claude Code version uses a project skill directory, the final layout should be:

~~~text
.claude/skills/shotpilot/SKILL.md
~~~

From the cloned repository, the installer can create the user-scoped copy:

~~~bash
node scripts/install.mjs claude
~~~

Copy-ready instruction:

~~~text
Install ShotPilot from https://github.com/ma-nucho-pro/shotpilot.
Inspect the repository first. Register the directory skills/shotpilot/ as an Agent Skill,
keeping SKILL.md at the skill root and preserving its references/ and scripts/ folders.
Do not overwrite unrelated skills, add provider credentials, or configure a webhook.
Run npm test from the repository root and report the installed path and whether Claude
Code has an image-generation tool available.
~~~

### Install with Codex

Codex can discover a skill directory containing <code>SKILL.md</code>. Use the [Codex skills documentation](https://developers.openai.com/codex/skills/) and the Codex skill installer when available, or use the bundled installer:

~~~bash
node scripts/install.mjs codex
~~~

The installer uses <code>$CODEX_HOME/skills/shotpilot/</code> when <code>CODEX_HOME</code> is set, otherwise <code>~/.codex/skills/shotpilot/</code>. If your Codex setup uses the interoperable <code>~/.agents/skills/</code> root, use <code>node scripts/install.mjs agents</code> instead. The optional UI metadata lives in <code>skills/shotpilot/agents/openai.yaml</code>; it does not add a provider or a second workflow.

Copy-ready instruction:

~~~text
Install the ShotPilot skill from
https://github.com/ma-nucho-pro/shotpilot/tree/main/skills/shotpilot.
Inspect the skill before installing it. Keep the directory layout intact, do not
overwrite unrelated skills, do not add credentials, and run npm test in the cloned
repository. Confirm the final Codex skill path and whether a native image-generation
tool is available for dispatch.
~~~

### Install with Cursor

Cursor discovers Agent Skills from project or user skill directories. See the [Cursor Skills documentation](https://cursor.com/docs/skills) for current discovery locations. A project-scoped layout is:

~~~text
.cursor/skills/shotpilot/SKILL.md
~~~

For a user-scoped install from the cloned repository:

~~~bash
node scripts/install.mjs cursor
~~~

For a user-scoped installation, use <code>~/.cursor/skills/shotpilot/</code> or <code>~/.agents/skills/shotpilot/</code>. After copying the folder, reload or list skills in Cursor and invoke ShotPilot when an image task matches its description.

Copy-ready instruction:

~~~text
Install ShotPilot from https://github.com/ma-nucho-pro/shotpilot.
Copy skills/shotpilot/ to .cursor/skills/shotpilot/ for this project, preserve
SKILL.md, references/, and scripts/, then reload the skills list. Do not alter
unrelated rules or settings. Run npm test and report whether Cursor exposes an
image-generation capability for the final dispatch step.
~~~

### Install with Gemini CLI

Gemini CLI supports Agent Skills and extensions. The direct skill install uses the current Agent Skills command:

~~~bash
gemini skills install https://github.com/ma-nucho-pro/shotpilot.git --path skills/shotpilot
~~~

The repository is also a Gemini CLI extension because it includes <code>gemini-extension.json</code>, <code>GEMINI.md</code>, and the bundled <code>skills/shotpilot/</code> directory:

~~~bash
gemini extensions install https://github.com/ma-nucho-pro/shotpilot
~~~

For a user-scoped skill copy without installing the extension:

~~~bash
node scripts/install.mjs gemini
~~~

For a workspace-local installation, the discovered layout can be:

~~~text
.gemini/skills/shotpilot/SKILL.md
~~~

For a user-scoped installation, use <code>~/.gemini/skills/shotpilot/</code> or the <code>~/.agents/skills/shotpilot/</code> alias.

Verify discovery in an interactive session with <code>/skills list</code>. Reload with <code>/skills reload</code> when supported by the installed Gemini CLI version.

Copy-ready instruction:

~~~text
Install the ShotPilot Agent Skill from
https://github.com/ma-nucho-pro/shotpilot.git using Gemini CLI's skill installer
with the repository subdirectory skills/shotpilot, or install the repository as
the ShotPilot Gemini extension. Preserve the complete skill directory, inspect
its scripts before activation, and confirm the result with /skills list.
Do not add credentials or claim that an image was generated unless Gemini CLI
has an image-generation tool or a configured ShotPilot webhook.
~~~

### Install in another Agent Skills harness

Use the same folder as the package. A compatible harness should discover the YAML frontmatter in <code>SKILL.md</code>, then load <code>references/</code> and <code>scripts/</code> relative to it:

~~~text
<skills-root>/shotpilot/SKILL.md
<skills-root>/shotpilot/references/
<skills-root>/shotpilot/scripts/
~~~

The generic user-scoped destination can be created with:

~~~bash
node scripts/install.mjs agents
~~~

If the harness uses a different discovery directory, follow that harness’s documented location. Do not move <code>SKILL.md</code> away from the skill root.

## Harness support

ShotPilot is distributed as a portable Agent Skill. “Supported” here means that the harness can discover and execute a <code>SKILL.md</code> directory; image generation still depends on the tools and permissions exposed by that harness.

| Harness | Repository integration | What to verify |
| --- | --- | --- |
| Claude Code | Portable <code>skills/shotpilot/SKILL.md</code>; the installer can target <code>~/.claude/skills/shotpilot/</code>. | The skill is discovered and the host exposes a generator or webhook. |
| Codex | Portable <code>SKILL.md</code> plus optional <code>agents/openai.yaml</code> UI metadata. | The skill is in a discovered Codex skill root and native image tools are available if automatic generation is expected. |
| Cursor | Portable <code>SKILL.md</code>; project install can use <code>.cursor/skills/shotpilot/</code>. | Reload/list skills after installation. |
| Gemini CLI | Direct Agent Skill plus optional extension with <code>gemini-extension.json</code>, <code>GEMINI.md</code>, and bundled <code>skills/</code>. | <code>/skills list</code> shows <code>shotpilot</code> before activation; <code>/extensions list</code> shows the extension when installed that way. |
| Other Agent Skills harnesses | Standard folder with <code>SKILL.md</code>, <code>references/</code>, and <code>scripts/</code>. | Confirm the harness’s discovery path and tool permissions. |

## Image backends

ShotPilot and an image model are two different layers:

- **ShotPilot** understands and validates the visual request.
- **The image backend** renders the pixels.

The skill’s routing policy is capability-based:

1. **Host-native image-generation tool** — preferred when the current agent exposes one, especially for reference-image edits. An image tool exposed through the host's MCP integration belongs in this tier.
2. **Configured JSON webhook** — the executable <code>send</code> command posts the unchanged canonical JSON to <code>SHOTPILOT_WEBHOOK_URL</code>. The endpoint can be a custom service, an n8n or Make workflow, or an MCP gateway you operate.
3. **No generator** — validation and prompt rendering still work, but ShotPilot does not report a generated image.

There is no provider SDK, image model, or MCP server bundled in this repository. GPT Image, Nano Banana, Flux, Midjourney, or another provider can be used only when the host exposes it or the webhook routes to it. Provider availability, authentication, cost, and reference support remain external to ShotPilot.

### Connect a webhook

macOS/Linux:

~~~bash
export SHOTPILOT_WEBHOOK_URL="https://your-endpoint.example/generate"
export SHOTPILOT_WEBHOOK_TOKEN="optional-bearer-token"
shotpilot send examples/candid-cafe.json
~~~

PowerShell:

~~~powershell
$env:SHOTPILOT_WEBHOOK_URL = "https://your-endpoint.example/generate"
$env:SHOTPILOT_WEBHOOK_TOKEN = "optional-bearer-token"
shotpilot send examples/candid-cafe.json
~~~

The webhook receives <code>application/json</code> with the canonical spec unchanged. If <code>SHOTPILOT_WEBHOOK_URL</code> is not set, <code>send</code> exits with an error instead of making a request.

## Examples

The checked-in example is a complete photographic generation spec:

~~~text
examples/candid-cafe.json
~~~

Validate and render it with:

~~~bash
shotpilot validate examples/candid-cafe.json
shotpilot render examples/candid-cafe.json
~~~

The schema also supports <code>generate</code>, <code>edit</code>, <code>inpaint</code>, and <code>multi_reference</code> modes. Edit-like modes require references and should put unchanged requirements in <code>intent.must_preserve</code>.

## Architecture and JSON

The agent-facing flow is:

~~~text
User request
    ↓
ShotPilot skill
    ├─ understand intent and hard constraints
    ├─ classify reference roles
    ├─ commission three independent specialist briefs
    ├─ compare alternatives and build canonical JSON
    ├─ add useful camera / lighting / composition detail
    ├─ validate ≥ 90/100
    ├─ independent preflight (or explicit degraded inline review)
    ├─ route to an available capability and inspect result
    └─ return the generated result, or an honest fallback
         ↓
      Image backend
         ↓
       Image
~~~

The canonical object is an internal contract. The normal agent workflow does not ask the user to copy it. The CLI exposes it because <code>validate</code>, <code>render</code>, and <code>send</code> are deterministic developer utilities.

The contract includes:

~~~text
intent → subjects → composition → camera → lighting → environment
       → look → realism → text_rendering → references
       → negative_constraints → output → dispatch
~~~

See the complete schema in [skills/shotpilot/references/spec-schema.md](skills/shotpilot/references/spec-schema.md).

Short excerpt:

~~~json
{
  "version": "1.0",
  "mode": "generate",
  "intent": {
    "goal": "What the finished image must accomplish",
    "asset_type": "photo",
    "must_preserve": [],
    "must_avoid": []
  },
  "references": [],
  "negative_constraints": ["watermark", "malformed hands"],
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
~~~

Validation is structural, not an artistic score. The included validator returns <code>VALID</code> only when there are no structural errors and the score is at least 90/100; the skill separately requires semantic fidelity to the user’s request.

## Commands

| Command | Behavior |
| --- | --- |
| <code>shotpilot validate spec.json</code> | Parse and score a canonical JSON spec. |
| <code>shotpilot render spec.json</code> | Flatten the canonical spec into a provider-friendly text prompt. |
| <code>shotpilot send spec.json</code> | POST the canonical JSON to <code>SHOTPILOT_WEBHOOK_URL</code>. |
| <code>node scripts/install.mjs &lt;target&gt;</code> | Copy the portable skill to a user-scoped harness location. Targets are <code>claude</code>, <code>codex</code>, <code>cursor</code>, <code>gemini</code>, <code>agents</code>, and <code>all</code>. |
| <code>npm test</code> | Run the deterministic validator/renderer checks. |
| <code>npm run check</code> | Run the same check script through the <code>check</code> npm alias. |
| <code>node bin/shotpilot.mjs</code> | Print CLI usage. |

The CLI does not contain a second LLM. The agent is responsible for compiling the request; the CLI provides deterministic validation, rendering, and transport.

## Repository layout

~~~text
shotpilot/
├── bin/shotpilot.mjs                       CLI entry point
├── examples/candid-cafe.json               complete example spec
├── scripts/install.mjs                      safe multi-harness skill installer
├── skills/shotpilot/
│   ├── SKILL.md                            core agent instructions
│   ├── agents/openai.yaml                   optional Codex UI metadata
│   ├── references/                         schema and guidance
│   └── scripts/
│       ├── validate-spec.mjs               deterministic 0–100 validator
│       ├── render-prompt.mjs               JSON → text prompt renderer
│       └── dispatch-webhook.mjs            JSON → webhook transport
├── tests/run.mjs                           local checks
├── GEMINI.md                               Gemini extension context
├── gemini-extension.json                   Gemini CLI extension manifest
├── .github/workflows/ci.yml                Node 18, 20, and 22 on three OSes
├── package.json                            CLI metadata and npm scripts
└── LICENSE                                 MIT license
~~~

The repository contains no provider credentials, database, daemon, telemetry service, native image backend, or MCP server. The webhook token is read only from the process environment.

## FAQ

### Does ShotPilot generate images by itself?

No. The skill orchestrates the request and dispatches it to a capability exposed by the host or to a configured webhook. Without either one, it stops at a validated spec and rendered prompt.

### Do I need to copy the JSON into another AI?

No in the normal Agent Skill workflow. The JSON is the internal contract passed to the available tool or adapter. The CLI commands intentionally accept a JSON file because they are developer-facing deterministic utilities.

### Is this a prompt enhancer?

Not primarily. Its core job is to preserve intent in a structured visual contract, validate it, adapt it to the available capability, and avoid a manual copy/paste loop.

### Does it include GPT Image, Nano Banana, Flux, or Midjourney adapters?

No provider adapter is included. Those backends can be connected through a host-native tool or a webhook that you control. ShotPilot does not claim a generation succeeded unless a connected capability actually returns a result.

### Is MCP built in?

No MCP server is bundled. An MCP image tool can be exposed by the host and is treated as a native image capability, or an MCP gateway can sit behind the configured webhook. The repository itself only implements the JSON webhook transport.

### What does the 90/100 threshold mean?

It is the implemented structural quality gate in <code>validate-spec.mjs</code>, not a judgment of artistic quality. Semantic failures still override the numeric score.

### Can I use it for edits and reference images?

Yes, the schema supports <code>edit</code>, <code>inpaint</code>, and <code>multi_reference</code>. Supply references with explicit roles and put unchanged requirements in <code>intent.must_preserve</code>. The actual generator must support the required reference or editing operation.

### What versions and dependencies are required?

Node.js 18.17 or newer. The package has no runtime npm dependencies and uses Node’s built-in modules. No image provider account is required for local validation or rendering.

## Author

**Roberto Manuel Jara Peche** — builder focused on AI systems, agents, and practical generative-AI workflows. Creator of projects such as **Wife**, and the person behind **@ManuchoAI**.

<p>
  <a href="https://github.com/ma-nucho-pro"><img src="https://img.shields.io/badge/GitHub-ma--nucho--pro-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <a href="https://www.youtube.com/@ManuchoAI"><img src="https://img.shields.io/badge/YouTube-@ManuchoAI-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  <a href="https://x.com/ManuchoAI"><img src="https://img.shields.io/badge/X-@ManuchoAI-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
  <a href="https://www.instagram.com/robertmanuchojp/"><img src="https://img.shields.io/badge/Instagram-robertmanuchojp-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://www.linkedin.com/in/roberto-manuel-jara-peche-10867240b/"><img src="https://img.shields.io/badge/LinkedIn-Roberto%20Manuel%20Jara%20Peche-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
</p>

## License

MIT © 2026 Roberto Manuel Jara Peche — see [LICENSE](LICENSE).
