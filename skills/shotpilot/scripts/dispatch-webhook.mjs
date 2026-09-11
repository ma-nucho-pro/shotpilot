#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: dispatch-webhook.mjs <spec.json>');
  process.exit(2);
}
const url = process.env.SHOTPILOT_WEBHOOK_URL;
if (!url) {
  console.error('ShotPilot webhook is not configured. Set SHOTPILOT_WEBHOOK_URL.');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
const headers = {'content-type':'application/json'};
const token = process.env.SHOTPILOT_WEBHOOK_TOKEN;
if (token) headers.authorization = `Bearer ${token}`;

const res = await fetch(url, {
  method: 'POST',
  headers,
  body: JSON.stringify(spec)
});
const text = await res.text();
if (!res.ok) {
  console.error(`Webhook failed: HTTP ${res.status}`);
  console.error(text.slice(0, 2000));
  process.exit(1);
}
console.log(text || `OK ${res.status}`);
