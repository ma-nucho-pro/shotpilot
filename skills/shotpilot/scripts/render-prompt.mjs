#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: render-prompt.mjs <spec.json>');
  process.exit(2);
}
const s = JSON.parse(fs.readFileSync(file, 'utf8'));
const lines = [];
const push = (label, value) => {
  if (value === undefined || value === null) return;
  if (Array.isArray(value) && value.length === 0) return;
  if (typeof value === 'string' && !value.trim()) return;
  lines.push(`${label}: ${Array.isArray(value) ? value.join('; ') : value}`);
};

push('Objective', s.intent?.goal);
push('Asset type', s.intent?.asset_type);
if (s.subjects?.length) {
  for (const sub of s.subjects) {
    const chunks = [sub.description, sub.appearance, sub.wardrobe?.join?.(', '), sub.pose_action, sub.expression].filter(Boolean);
    push(`Subject ${sub.id || ''}`.trim(), chunks.join('. '));
  }
}
push('Framing', s.composition?.framing);
push('Camera angle', [s.composition?.camera_angle, s.composition?.perspective].filter(Boolean).join(', '));
push('Placement', s.composition?.subject_placement);
push('Foreground', s.composition?.foreground);
push('Background', s.composition?.background);
push('Depth', s.composition?.depth_layers);

const cam = s.camera || {};
push('Capture', [cam.capture_style, cam.device, cam.lens, cam.focal_length_mm ? `${cam.focal_length_mm}mm` : '', cam.aperture, cam.focus, cam.depth_of_field, cam.motion].filter(Boolean).join(', '));
const light = s.lighting || {};
push('Lighting', [light.sources?.join?.(', '), light.direction, light.quality, light.exposure, light.color_temperature].filter(Boolean).join(', '));
const env = s.environment || {};
push('Environment', [env.location, env.time, env.weather, env.details?.join?.(', ')].filter(Boolean).join(', '));
const look = s.look || {};
push('Visual look', [look.medium, look.style, look.color, look.texture, look.post_processing].filter(Boolean).join(', '));
push('Realism anchors', s.realism?.anchors);
push('Natural imperfections', s.realism?.imperfections);
push('Anatomy checks', s.realism?.anatomy_checks);

if (s.text_rendering?.enabled) {
  push('Exact visible text — preserve spelling exactly', s.text_rendering.exact_text?.map(t => JSON.stringify(t)));
  push('Text placement', s.text_rendering.placement);
  push('Typography', s.text_rendering.typography);
}

if (s.references?.length) {
  for (const ref of s.references) push(`Reference ${ref.id} (${ref.role})`, ref.instruction || ref.path);
}
push('Must preserve', s.intent?.must_preserve);
push('Must avoid', s.intent?.must_avoid);
push('Negative constraints', s.negative_constraints);
push('Output', [`aspect ratio ${s.output?.aspect_ratio}`, s.output?.resolution, `${s.output?.count || 1} image(s)`, s.output?.background ? `background ${s.output.background}` : '', s.output?.format].filter(Boolean).join(', '));

console.log(lines.join('\n'));
