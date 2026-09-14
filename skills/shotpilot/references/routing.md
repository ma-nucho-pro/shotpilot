# Generator routing

Prefer capabilities over hardcoded model names; model catalogs change.

1. **Host-native generator first.** This includes an image-generation tool exposed by the harness's MCP integration. It usually has the best access to attached references and the least setup friction; do not invent or start an MCP server if none is exposed.
2. **Reference/identity edits:** choose a generator/tool path that explicitly supports image references or editing.
3. **Exact text/posters/UI:** prefer a generator with strong typography/layout control.
4. **People:** prefer strong anatomy, identity consistency, and reference fidelity.
5. **Products:** prefer material fidelity, edge accuracy, and controllable studio lighting.
6. **Illustration/stylization:** prioritize aesthetic/style control over photographic realism.
7. **No known generator:** use the configured ShotPilot webhook. The webhook receives canonical JSON unchanged.

Never silently switch a user-selected generator/model. If the runtime exposes multiple models and the user did not choose one, select the best fit based on the categories above and keep the decision internal unless cost or a material trade-off requires consent.
