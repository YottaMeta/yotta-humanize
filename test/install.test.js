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
  assert.match(r.stdout, /用法:/);
});

test('--version exits 0 and prints skill version', () => {
  const r = run(['--version']);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, new RegExp('^' + SKILL + ' v\\d+\\.\\d+\\.\\d+'));
});

test('unknown argument exits 2 without writing anything', () => {
  const cwd = tempdir('yotta_humanize-unknown-');
  try {
    fs.mkdirSync(path.join(cwd, '.agents', 'skills'), { recursive: true });
    const r = run(['--wat'], { cwd });
    assert.strictEqual(r.status, 2, r.stdout);
    assert.match(r.stderr, /未知参数: --wat/);
    assert.deepStrictEqual(fs.readdirSync(path.join(cwd, '.agents', 'skills')), []);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('unknown agent exits 2 with a fix suggestion', () => {
  const r = run(['--agent', 'does-not-exist']);
  assert.strictEqual(r.status, 2, r.stdout);
  assert.match(r.stderr, /未收录智能体: does-not-exist/);
  assert.match(r.stderr, /--dir/);
});

test('missing --dir value exits 2', () => {
  const r = run(['--dir']);
  assert.strictEqual(r.status, 2, r.stdout);
  assert.match(r.stderr, /--dir 需要一个非空路径/);
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

test('residue in target is cleaned while other files stay', () => {
  const dest = tempdir('yotta_humanize-residue-');
  try {
    const target = path.join(dest, SKILL);
    fs.mkdirSync(path.join(target, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(target, 'SKILL.md'), '# stale\n');
    fs.writeFileSync(path.join(target, 'package.json'), '{"version":"0.0.1"}');
    fs.writeFileSync(path.join(target, 'bin', 'old.js'), 'old\n');
    fs.writeFileSync(path.join(target, 'keep.txt'), 'keep\n');
    const r = run(['--dir', dest]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(!fs.existsSync(path.join(target, 'package.json')));
    assert.ok(!fs.existsSync(path.join(target, 'bin')));
    assert.ok(fs.existsSync(path.join(target, 'keep.txt')));
  } finally {
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('no target exits 4 with guidance', () => {
  const cwd = tempdir('yotta_humanize-empty-');
  try {
    const r = run([], { cwd });
    assert.strictEqual(r.status, 4, r.stdout);
    assert.match(r.stderr, /未检测到项目级智能体目录/);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
