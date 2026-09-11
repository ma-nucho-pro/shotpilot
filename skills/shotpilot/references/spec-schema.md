# ShotPilot Canonical Image Spec v1

Use one top-level object. Omit irrelevant optional detail rather than filling it with nonsense.

```json
{
  "version": "1.0",
  "mode": "generate",
  "intent": {
    "goal": "What the finished image must accomplish",
    "asset_type": "photo|portrait|product|poster|illustration|ui|diagram|character|architecture|other",
    "priority": ["fidelity", "realism"],
    "must_preserve": [],
    "must_avoid": []
  },
  "subjects": [
    {
      "id": "subject_1",
      "description": "",
      "reference_id": null,
      "appearance": "",
      "wardrobe": [],
      "pose_action": "",
      "expression": ""
    }
  ],
  "composition": {
    "framing": "",
    "camera_angle": "",
    "perspective": "standard eye-level",
    "subject_placement": "",
    "foreground": "",
    "background": "",
    "depth_layers": []
  },
  "camera": {
    "capture_style": "",
    "device": "",
    "lens": "",
    "focal_length_mm": null,
    "aperture": "",
    "focus": "",
    "depth_of_field": "",
    "motion": ""
  },
  "lighting": {
    "sources": [],
    "direction": "",
    "quality": "",
    "exposure": "",
    "color_temperature": ""
  },
  "environment": {
    "location": "",
    "time": "",
    "weather": "",
    "details": []
  },
  "look": {
    "medium": "photograph",
    "style": "",
    "color": "",
    "texture": "",
    "post_processing": ""
  },
  "realism": {
    "anchors": [],
    "imperfections": [],
    "anatomy_checks": []
  },
  "text_rendering": {
    "enabled": false,
    "exact_text": [],
    "placement": [],
    "typography": ""
  },
  "references": [
    {
      "id": "image_1",
      "role": "identity|composition|style|product|environment|edit_target",
      "path": "",
      "instruction": ""
    }
  ],
  "negative_constraints": [],
  "output": {
    "aspect_ratio": "1:1",
    "resolution": "auto",
    "count": 1,
    "background": "auto",
    "format": "png"
  },
  "dispatch": {
    "preferred_adapter": "native",
    "provider": "auto",
    "model": "auto",
    "quality": "high",
    "auto_generate": true,
    "auto_retry": false
  }
}
```

## Required semantics

- `intent.goal` is the one-sentence success condition.
- `must_preserve` is critical for edits and reference work.
- `subjects` may be empty for pure landscapes, environments, diagrams, or UI, but the environment/composition must then carry the subject matter.
- `reference_id` must match an item in `references` when used.
- `exact_text` must reproduce user-supplied visible text character-for-character.
- `negative_constraints` should be specific to likely failures; do not dump unrelated negatives.
- `dispatch` describes routing, not visible creative content.

## Edit mode

For `edit`, `inpaint`, or `multi_reference`, include at least one reference with role `edit_target` or another explicit role and put unchanged requirements in `intent.must_preserve`.

## Photorealistic mode

For a photographic look, `camera`, `lighting`, and `realism` should contain plausible specifics. Prefer a few relevant details over a wall of camera jargon.
