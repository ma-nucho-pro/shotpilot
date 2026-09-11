# ShotPilot quality rubric

The validator scores structural completeness. The agent must also perform a semantic fidelity check.

| Area | Weight | Pass condition |
|---|---:|---|
| Intent fidelity | 25 | Goal and hard constraints mirror the request |
| Composition/spatial logic | 15 | Framing, placement, foreground/background are coherent |
| Subject/material specificity | 15 | Visible details are concrete and non-contradictory |
| Lighting | 10 | Source, direction/quality, and exposure are plausible |
| Camera/perspective | 10 | Capture language fits the desired medium |
| Realism/style consistency | 10 | Realism anchors or style details match the medium |
| Negative constraints | 5 | Likely failure modes are blocked without conflicts |
| Output contract | 5 | Aspect ratio/count/format are explicit |
| References/text fidelity | 5 | Reference roles and exact visible text are preserved |

Target: **90/100+** for final dispatch.

Semantic failure overrides score. Examples: wrong number of people, altered logo/text, missing "keep unchanged" constraint, or identity reference treated as mere style inspiration.
