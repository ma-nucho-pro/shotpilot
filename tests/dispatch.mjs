import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dispatcher = path.join(root, 'skills/shotpilot/scripts/dispatch-webhook.mjs');
const example = JSON.parse(fs.readFileSync(path.join(root, 'examples/candid-cafe.json'), 'utf8'));

async function dispatch(t, input, {status = 200, response = 'accepted', token = ''} = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shotpilot-dispatch-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const file = path.join(dir, 'spec with spaces.json');
  fs.writeFileSync(file, input);
  const requests = [];
  let connections = 0;
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push({method: req.method, url: req.url, headers: req.headers,
      body: Buffer.concat(chunks).toString('utf8')});
    res.writeHead(status, {'content-type': 'text/plain', connection: 'close'});
    res.end(response);
  });
  server.on('connection', () => connections++);
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const child = spawn(process.execPath, [dispatcher, file], {
    cwd: dir,
    env: {...process.env,
      SHOTPILOT_WEBHOOK_URL: `http://127.0.0.1:${server.address().port}/generate?test=1`,
      SHOTPILOT_WEBHOOK_TOKEN: token},
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  const timer = setTimeout(() => child.kill(), 10000);
  let code, signal;
  try {
    [code, signal] = await once(child, 'close');
  } finally {
    clearTimeout(timer);
  }
  assert.equal(signal, null, `Dispatcher terminated: ${stderr}`);
  return {code, stdout, stderr, requests, connections};
}

test('valid spec posts the exact JSON payload and bearer token once', async t => {
  const result = await dispatch(t, JSON.stringify(example, null, 2), {token: 'local-test-token'});
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout, 'accepted\n');
  assert.equal(result.stderr, '');
  assert.equal(result.requests.length, 1);
  const [request] = result.requests;
  assert.equal(request.method, 'POST');
  assert.equal(request.url, '/generate?test=1');
  assert.equal(request.headers['content-type'], 'application/json');
  assert.equal(request.headers.authorization, 'Bearer local-test-token');
  assert.equal(request.body, JSON.stringify(example));
});

test('schema-invalid spec fails validation without a network connection', async t => {
  const invalid = structuredClone(example);
  invalid.output.count = 0;
  const result = await dispatch(t, JSON.stringify(invalid));
  assert.equal(result.code, 1);
  assert.match(result.stderr, /INVALID/);
  assert.match(result.stderr, /output.count must be an integer from 1 to 8/);
  assert.equal(result.stdout, '');
  assert.equal(result.connections, 0);
  assert.deepEqual(result.requests, []);
});

test('spec below the validator score threshold makes no network connection', async t => {
  const lowScore = {version: '1.0', mode: 'generate',
    intent: {goal: 'Draw a tree', asset_type: 'illustration'},
    subjects: [{description: 'A tree'}], look: {medium: 'illustration'},
    output: {aspect_ratio: '1:1', count: 1, format: 'png'}};
  const result = await dispatch(t, JSON.stringify(lowScore));
  assert.equal(result.code, 1);
  assert.match(result.stderr, /INVALID/);
  assert.doesNotMatch(result.stderr, /ERROR:/);
  const score = result.stderr.match(/score: (\d+)\/100/);
  assert.ok(score && Number(score[1]) < 90, result.stderr);
  assert.equal(result.connections, 0);
  assert.deepEqual(result.requests, []);
});

test('malformed JSON reports validator diagnostics without a network connection', async t => {
  const result = await dispatch(t, '{');
  assert.equal(result.code, 1);
  assert.match(result.stderr, /INVALID\n- JSON parse error:/);
  assert.equal(result.connections, 0);
  assert.deepEqual(result.requests, []);
});

test('HTTP error exits nonzero and reports a bounded response body', async t => {
  const response = 'service unavailable: ' + 'x'.repeat(2100);
  const result = await dispatch(t, JSON.stringify(example), {status: 503, response});
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, `Webhook failed: HTTP 503\n${response.slice(0, 2000)}\n`);
  assert.equal(result.requests.length, 1);
  assert.equal(result.requests[0].body, JSON.stringify(example));
  assert.equal(result.requests[0].headers.authorization, undefined);
});
