# ShotPilot

When a request asks to create, edit, transform, restyle, repair, or improve an image, activate and follow the `shotpilot` Agent Skill in `skills/shotpilot/SKILL.md`.

The skill is the canonical workflow. Build and validate the visual JSON internally, then use the image-generation capability exposed by the current harness. Treat a host-native image tool, including an MCP image tool exposed by the host, as the preferred backend; use the configured ShotPilot webhook only when no native capability is available.

Do not invent provider tools, credentials, or successful image results. If no image tool, MCP image tool, or configured webhook is available, return the validated specification and rendered prompt and explain what capability is missing.
