import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const example = path.join(root, 'examples/candid-cafe.json');
const validate = path.join(root, 'skills/shotpilot/scripts/validate-spec.mjs');
const render = path.join(root, 'skills/shotpilot/scripts/render-prompt.mjs');

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

const malformed = path.join(root, 'tests/.tmp-invalid.json');
fs.writeFileSync(malformed, '{"version":"1.0","mode":"generate"}');
const bad = spawnSync(process.execPath, [validate, malformed], {encoding:'utf8'});
fs.unlinkSync(malformed);
ok('invalid spec fails', bad.status !== 0, bad.stdout);

let failed = 0;
for (const [name, pass, detail] of checks) {
  console.log(`${pass ? '✓' : '✗'} ${name}`);
  if (!pass) { failed++; if (detail) console.log(detail.trim()); }
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
