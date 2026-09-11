#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillScripts = path.resolve(here, '../skills/shotpilot/scripts');
const [cmd, file] = process.argv.slice(2);
if (!cmd || !file || !['validate','render','send'].includes(cmd)) {
  console.log('Usage: shotpilot <validate|render|send> <spec.json>');
  process.exit(cmd ? 2 : 0);
}
const map = {
  validate: 'validate-spec.mjs',
  render: 'render-prompt.mjs',
  send: 'dispatch-webhook.mjs'
};
const r = spawnSync(process.execPath, [path.join(skillScripts, map[cmd]), file], {stdio:'inherit', env:process.env});
process.exit(r.status ?? 1);
