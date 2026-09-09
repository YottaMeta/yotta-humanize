const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BIN = path.join(__dirname, '..', 'bin', 'install.js');
const SKILL = 'yotta-humanize';

function run(args, opts = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    cwd: opts.cwd || path.join(__dirname, '..'),
    env: process.env,
  });
}

function tempdir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('--help exits 0 and prints usage', () => {
  const r = run(['--help']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /Usage:/);
});

test('unknown agent exits 2 with a fix suggestion', () => {
  const r = run(['--agent', 'does-not-exist']);
  assert.strictEqual(r.status, 2, r.stdout);
  assert.match(r.stderr, /Unknown agent: does-not-exist/);
  assert.match(r.stderr, /Use --dir for a custom directory/);
});

test('missing --dir value exits 2', () => {
  const r = run(['--dir']);
  assert.strictEqual(r.status, 2, r.stdout);
  assert.match(r.stderr, /--dir requires a non-empty path/);
});

test('successful install copies SKILL.md and excludes package metadata', () => {
  const dest = tempdir('yotta_humanize-install-');
  try {
    const r = run(['--dir', dest]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(fs.existsSync(path.join(dest, SKILL, 'SKILL.md')));
    assert.ok(!fs.existsSync(path.join(dest, SKILL, 'package.json')));
    assert.ok(!fs.existsSync(path.join(dest, SKILL, 'bin')));
    assert.ok(!fs.existsSync(path.join(dest, SKILL, '.git')));
    assert.match(r.stdout, /installed -> /);
  } finally {
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('no target exits 4 with guidance', () => {
  const cwd = tempdir('yotta_humanize-empty-');
  try {
    const r = run([], { cwd });
    assert.strictEqual(r.status, 4, r.stdout);
    assert.match(r.stderr, /No project-level agent directory detected/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
