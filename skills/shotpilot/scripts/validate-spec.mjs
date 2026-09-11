#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: validate-spec.mjs <spec.json>');
  process.exit(2);
}

let spec;
try {
  spec = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`INVALID\n- JSON parse error: ${err.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
let score = 0;
const has = (v) => typeof v === 'string' ? v.trim().length > 0 : v !== undefined && v !== null;
const arr = (v) => Array.isArray(v) ? v : [];

if (spec.version === '1.0') score += 2; else warnings.push('version should be "1.0"');
if (['generate','edit','inpaint','multi_reference'].includes(spec.mode)) score += 3; else errors.push('mode must be generate, edit, inpaint, or multi_reference');

if (has(spec.intent?.goal)) score += 15; else errors.push('intent.goal is required');
if (has(spec.intent?.asset_type)) score += 5; else errors.push('intent.asset_type is required');
const preserve = arr(spec.intent?.must_preserve);
const avoid = arr(spec.intent?.must_avoid);
score += Math.min(5, preserve.length + avoid.length);

const subjects = arr(spec.subjects);
const envMeaningful = has(spec.environment?.location) || arr(spec.environment?.details).length > 0;
if (subjects.length || envMeaningful) score += 10; else errors.push('define at least one subject or a meaningful environment');
if (subjects.length) {
  const described = subjects.filter(s => has(s?.description)).length;
  score += Math.min(5, described * 2);
}

const comp = spec.composition || {};
if (has(comp.framing)) score += 5; else warnings.push('composition.framing is empty');
if (has(comp.camera_angle) || has(comp.perspective)) score += 4; else warnings.push('camera angle/perspective is undefined');
if (has(comp.subject_placement) || has(comp.background) || arr(comp.depth_layers).length) score += 4;

const light = spec.lighting || {};
if (arr(light.sources).length) score += 5; else warnings.push('lighting.sources is empty');
if (has(light.quality) || has(light.direction)) score += 4;
if (has(light.exposure) || has(light.color_temperature)) score += 2;

const look = spec.look || {};
if (has(look.medium)) score += 3; else errors.push('look.medium is required');
if (has(look.style) || has(look.texture) || has(look.color)) score += 4;

const medium = String(look.medium || '').toLowerCase();
const photoLike = /(photo|photograph|camera|phone|iphone|film)/.test(medium) || /(photo|realistic|photoreal)/.test(String(look.style || '').toLowerCase());
if (photoLike) {
  const cam = spec.camera || {};
  if (has(cam.device) || has(cam.lens) || has(cam.capture_style)) score += 5; else warnings.push('photorealistic spec lacks concrete camera/capture detail');
  const anchors = arr(spec.realism?.anchors);
  const imperfections = arr(spec.realism?.imperfections);
  if (anchors.length >= 2) score += 5; else warnings.push('photorealistic spec should include at least 2 realism anchors');
  if (imperfections.length >= 2) score += 4; else warnings.push('photorealistic spec should include 2+ context-appropriate imperfections');
} else {
  score += 10;
}

const texts = spec.text_rendering || {};
if (texts.enabled) {
  if (arr(texts.exact_text).length) score += 4; else errors.push('text_rendering.enabled=true requires exact_text');
  if (arr(texts.placement).length || has(texts.typography)) score += 2; else warnings.push('visible text lacks placement/typography guidance');
} else score += 2;

const refs = arr(spec.references);
const refIds = new Set(refs.map(r => r?.id).filter(Boolean));
for (const s of subjects) {
  if (s?.reference_id && !refIds.has(s.reference_id)) errors.push(`subject reference_id "${s.reference_id}" has no matching references entry`);
}
if (['edit','inpaint','multi_reference'].includes(spec.mode)) {
  if (refs.length) score += 4; else errors.push(`${spec.mode} mode requires references`);
  if (preserve.length) score += 2; else warnings.push(`${spec.mode} mode should usually define intent.must_preserve`);
} else score += 3;

const neg = arr(spec.negative_constraints);
if (neg.length >= 2) score += 4; else warnings.push('negative_constraints should contain at least 2 relevant items');

const out = spec.output || {};
if (/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(String(out.aspect_ratio || ''))) score += 3; else errors.push('output.aspect_ratio must look like 1:1, 4:5, 16:9, etc.');
if (Number.isInteger(out.count) && out.count >= 1 && out.count <= 8) score += 2; else errors.push('output.count must be an integer from 1 to 8');
if (['png','jpeg','jpg','webp','auto'].includes(String(out.format || '').toLowerCase())) score += 1; else warnings.push('output.format is unusual');

if (spec.dispatch?.auto_generate === true) score += 3; else warnings.push('dispatch.auto_generate is not true');
if (has(spec.dispatch?.preferred_adapter)) score += 2;

score = Math.min(100, score);
const pass = errors.length === 0 && score >= 90;
console.log(pass ? 'VALID' : 'INVALID');
console.log(`score: ${score}/100`);
for (const e of errors) console.log(`ERROR: ${e}`);
for (const w of warnings) console.log(`WARN: ${w}`);
process.exit(pass ? 0 : 1);
