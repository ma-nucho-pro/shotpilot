# ShotPilot repository instructions

The distributable skill lives in `skills/shotpilot/`.

When changing behavior:
1. keep `SKILL.md` concise and push detailed guidance into `references/`;
2. preserve the canonical JSON contract in `references/spec-schema.md`;
3. keep runtime scripts dependency-free on Node 18.17+;
4. run `npm test` before claiming success;
5. never add secrets or hardcode provider credentials.
