#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillSource = path.join(projectRoot, 'skills', 'shotpilot');

const usage = `Usage: node scripts/install.mjs <target> [options]

Targets:
  claude    Install to ~/.claude/skills/shotpilot/
  codex     Install to $CODEX_HOME/skills/shotpilot/ or ~/.codex/skills/shotpilot/
  cursor    Install to ~/.cursor/skills/shotpilot/
  gemini    Install to ~/.gemini/skills/shotpilot/
  agents    Install to ~/.agents/skills/shotpilot/
  all       Install to every target above

Options:
  --home <path>  Use a different home directory (useful for testing)
  --dry-run      Show destinations without writing files
  --force        Update an existing ShotPilot installation
  --help         Show this help
`;

function fail(message) {
  console.error(`ShotPilot installer: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let target;
  let home;
  let dryRun = false;
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log(usage);
      process.exit(0);
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (arg === '--home') {
      home = argv[++i];
      if (!home) fail('--home requires a directory path.');
      continue;
    }
    if (arg.startsWith('--')) fail(`unknown option: ${arg}`);
    if (target) fail(`unexpected argument: ${arg}`);
    target = arg;
  }

  if (!target) {
    console.log(usage);
    process.exit(2);
  }

  const targets = ['claude', 'codex', 'cursor', 'gemini', 'agents', 'all'];
  if (!targets.includes(target)) {
    fail(`unknown target "${target}". Choose one of: ${targets.join(', ')}.`);
  }

  return {
    target,
    home: path.resolve(home || os.homedir()),
    dryRun,
    force
  };
}

function destinationFor(name, home) {
  if (name === 'claude') return path.join(home, '.claude', 'skills', 'shotpilot');
  if (name === 'codex') {
    const codexHome = process.env.CODEX_HOME
      ? path.resolve(process.env.CODEX_HOME)
      : path.join(home, '.codex');
    return path.join(codexHome, 'skills', 'shotpilot');
  }
  if (name === 'cursor') return path.join(home, '.cursor', 'skills', 'shotpilot');
  if (name === 'gemini') return path.join(home, '.gemini', 'skills', 'shotpilot');
  if (name === 'agents') return path.join(home, '.agents', 'skills', 'shotpilot');
  throw new Error(`unsupported target: ${name}`);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

const options = parseArgs(process.argv.slice(2));
if (!(await exists(skillSource))) fail(`skill source not found: ${skillSource}`);

const names = options.target === 'all'
  ? ['claude', 'codex', 'cursor', 'gemini', 'agents']
  : [options.target];
const destinations = [...new Map(names.map((name) => [destinationFor(name, options.home), name])).entries()];

for (const [destination, name] of destinations) {
  const alreadyInstalled = await exists(destination);
  if (alreadyInstalled && !options.force && !options.dryRun) {
    fail(`${name} destination already exists: ${destination}. Use --force to update it.`);
  }

  console.log(`${options.dryRun ? 'Would install' : alreadyInstalled ? 'Would update' : 'Installing'} ${name}:`);
  console.log(`  source:      ${skillSource}`);
  console.log(`  destination: ${destination}`);

  if (!options.dryRun) {
    await fs.mkdir(path.dirname(destination), {recursive: true});
    await fs.cp(skillSource, destination, {recursive: true, force: true, errorOnExist: false});
  }
}

if (options.dryRun) {
  console.log('\nDry run complete; no files were changed.');
} else {
  console.log('\nInstallation complete. Reload the harness or its skill list if required.');
}
