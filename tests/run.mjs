import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const example = path.join(root, 'examples/candid-cafe.json');
const validate = path.join(root, 'skills/shotpilot/scripts/validate-spec.mjs');
const render = path.join(root, 'skills/shotpilot/scripts/render-prompt.mjs');
const installer = path.join(root, 'scripts/install.mjs');

const checks = [];
function ok(name, condition, detail='') {
  checks.push([name, !!condition, detail]);
}

const vr = spawnSync(process.execPath, [validate, example], {encoding:'utf8'});
ok('example validates', vr.status === 0, vr.stdout + vr.stderr);
ok('validation says VALID', /\bVALID\b/.test(vr.stdout), vr.stdout);
ok('score is >= 90', Number((vr.stdout.match(/score:\s*(\d+)/)||[])[1]) >= 90, vr.stdout);

const rr = spawnSync(process.execPath, [render, example], {encoding:'utf8'});
ok('render exits 0', rr.status === 0, rr.stderr);
ok('render includes objective', rr.stdout.includes('Objective:'), rr.stdout);
ok('render includes negative constraints', rr.stdout.includes('Negative constraints:'), rr.stdout);

const malformedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shotpilot-invalid-'));
const malformed = path.join(malformedDir, 'invalid.json');
fs.writeFileSync(malformed, '{"version":"1.0","mode":"generate"}');
const bad = spawnSync(process.execPath, [validate, malformed], {encoding:'utf8'});
fs.rmSync(malformedDir, {recursive: true, force: true});
ok('invalid spec fails', bad.status !== 0, bad.stdout);

const installDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shotpilot-install-'));
const install = spawnSync(process.execPath, [installer, 'agents', '--home', installDir], {encoding:'utf8'});
const installedSkill = path.join(installDir, '.agents', 'skills', 'shotpilot');
ok('installer exits 0', install.status === 0, install.stdout + install.stderr);
ok('installer copies SKILL.md', fs.existsSync(path.join(installedSkill, 'SKILL.md')), install.stdout);
ok('installer copies references and scripts',
  fs.existsSync(path.join(installedSkill, 'references', 'spec-schema.md')) &&
  fs.existsSync(path.join(installedSkill, 'scripts', 'validate-spec.mjs')),
  install.stdout);
const refusedUpdate = spawnSync(process.execPath, [installer, 'agents', '--home', installDir], {encoding:'utf8'});
ok('installer protects an existing copy', refusedUpdate.status !== 0, refusedUpdate.stdout + refusedUpdate.stderr);
const forcedUpdate = spawnSync(process.execPath, [installer, 'agents', '--home', installDir, '--force'], {encoding:'utf8'});
ok('installer updates only with force', forcedUpdate.status === 0, forcedUpdate.stdout + forcedUpdate.stderr);
fs.rmSync(installDir, {recursive: true, force: true});

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(root, 'gemini-extension.json'), 'utf8'));
} catch (error) {
  manifest = null;
  ok('Gemini manifest parses', false, String(error));
}
if (manifest) {
  ok('Gemini manifest identifies ShotPilot',
    manifest.name === 'shotpilot' && manifest.contextFileName === 'GEMINI.md',
    JSON.stringify(manifest));
}

const openaiYaml = fs.readFileSync(path.join(root, 'skills/shotpilot/agents/openai.yaml'), 'utf8');
ok('Codex metadata names the skill',
  /display_name:\s+"ShotPilot"/.test(openaiYaml) && /allow_implicit_invocation:\s+true/.test(openaiYaml),
  openaiYaml);

const dispatchChecks = spawnSync(process.execPath, [path.join(root, 'tests/dispatch.mjs')], {encoding:'utf8'});
ok('webhook transport validates before network and preserves payload', dispatchChecks.status === 0, dispatchChecks.stdout + dispatchChecks.stderr);

let failed = 0;
for (const [name, pass, detail] of checks) {
  console.log(`${pass ? '✓' : '✗'} ${name}`);
  if (!pass) { failed++; if (detail) console.log(detail.trim()); }
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
