#!/usr/bin/env node
/**
 * @yottameta/yotta-humanize cross-platform installer.
 *
 * Usage:
 *   npx -y @yottameta/yotta-humanize --agent <name>
 *   npx -y @yottameta/yotta-humanize --dir <path>
 *   npx -y @yottameta/yotta-humanize -g
 *   npx -y @yottameta/yotta-humanize
 *   npx -y @yottameta/yotta-humanize --list
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'yotta-humanize';
const PKG_ROOT = path.join(__dirname, '..');
const COPY_SKIP = new Set(['package.json', 'bin', 'node_modules', '.git', '.github', 'test']);

const AGENT_DIRS = {
  claude:    { label: 'Claude Code',      dirs: ['.claude/skills'] },
  cursor:    { label: 'Cursor',           dirs: ['.cursor/skills', '.agents/skills'] },
  codex:     { label: 'Codex',            dirs: ['.codex/skills'] },
  gemini:    { label: 'Gemini CLI',       dirs: ['.gemini/skills', '.agents/skills'] },
  goose:     { label: 'Goose',            dirs: ['.config/goose/skills', '.agents/skills'] },
  amp:       { label: 'Amp',              dirs: ['.config/agents/skills', '.agents/skills'] },
  opencode:  { label: 'OpenCode',         dirs: ['.config/opencode/skills'] },
  windsurf:  { label: 'Windsurf',         dirs: ['.codeium/windsurf/skills'] },
  workbuddy: { label: 'WorkBuddy',        dirs: ['.workbuddy/skills'] },
  kiro:      { label: 'Kiro',             dirs: ['.kiro/skills'] },
  trae:      { label: 'Trae Code CLI',    dirs: ['.traecli/skills'] },
  'trae-cn': { label: 'Trae IDE',         dirs: ['.trae-cn/skills'] },
  qwen:      { label: 'Qwen Code',        dirs: ['.qwen/skills'] },
  comate:    { label: 'Comate',           dirs: ['.comate/skills'] },
  codebuddy: { label: 'CodeBuddy Code',   dirs: ['.codebuddy/skills'] },
  kimi:      { label: 'Kimi Code CLI',    dirs: ['.kimi/skills'] },
  agents:    { label: 'Generic AGENTS.md', dirs: ['.agents/skills'] },
};

class UsageError extends Error {}
class TargetError extends Error {}
class InstallError extends Error {}

function usage() {
  console.log('yotta-humanize installer');
  console.log('');
  console.log('Usage:');
  console.log('  npx -y @yottameta/yotta-humanize --agent <name>  Install to an agent default directory');
  console.log('  npx -y @yottameta/yotta-humanize --dir <path>     Install to a custom directory');
  console.log('  npx -y @yottameta/yotta-humanize -g               Install to all known agent directories');
  console.log('  npx -y @yottameta/yotta-humanize                  Auto-detect project-level directories');
  console.log('  npx -y @yottameta/yotta-humanize --list           List supported agent directories');
  console.log('');
  console.log('Options:');
  console.log('  --agent <name>  Agent key, see --list');
  console.log('  --dir <path>    Custom skills directory');
  console.log('  -g, --global    Install to all known user-level directories');
  console.log('  --list, -l      List supported agents');
  console.log('  -h, --help      Show this help');
}

function parseArgs(argv) {
  const opts = { help: false, list: false, global: false, dir: null, agent: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--list' || arg === '-l') opts.list = true;
    else if (arg === '--global' || arg === '-g') opts.global = true;
    else if (arg === '--dir') {
      const value = argv[++i];
      if (!value) throw new UsageError('--dir requires a non-empty path');
      opts.dir = value;
    } else if (arg === '--agent') {
      const value = argv[++i];
      if (!value) throw new UsageError('--agent requires a non-empty name');
      opts.agent = value.toLowerCase();
    } else {
      throw new UsageError('Unknown argument: ' + arg);
    }
  }
  if (!opts.help) {
    const selected = [opts.dir, opts.agent, opts.global].filter(Boolean).length;
    if (selected > 1) throw new UsageError('Use only one of --dir, --agent, or -g');
  }
  return opts;
}

function codexUserDir() {
  const base = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  return path.join(base, 'skills');
}

function opencodeUserDir() {
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'opencode', 'skills');
}

function resolveUserDir(rel) {
  if (rel === '.codex/skills') return codexUserDir();
  if (rel === '.config/opencode/skills') return opencodeUserDir();
  return path.join(os.homedir(), rel);
}

function displayDir(rel) {
  if (process.platform === 'win32') return '%USERPROFILE%\\' + rel.replace(/\//g, '\\');
  return '~/' + rel;
}

function printList() {
  console.log('Agent -> default skill directory:');
  for (const [key, value] of Object.entries(AGENT_DIRS)) {
    console.log('  ' + key.padEnd(12) + value.label.padEnd(20) + value.dirs.map(displayDir).join(', '));
  }
  console.log('');
  console.log('Use --dir <path> for agents not listed. CODEX_HOME and XDG_CONFIG_HOME are respected.');
}

function assertSafeTarget(target) {
  const rel = path.relative(PKG_ROOT, target);
  if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
    throw new UsageError('Target directory must be outside the skill source directory');
  }
}

function copyDir(src, dst, skip) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    try {
      if (entry.isDirectory()) {
        fs.mkdirSync(to, { recursive: true });
        copyDir(from, to, skip);
      } else if (entry.isFile()) {
        fs.copyFileSync(from, to);
      }
    } catch (err) {
      throw new InstallError('Failed to copy ' + from + ' -> ' + to + ': ' + err.message);
    }
  }
}

function installTo(dest) {
  if (!dest || typeof dest !== 'string') throw new UsageError('Destination directory is required');
  const target = path.resolve(dest, SKILL_NAME);
  assertSafeTarget(target);
  try {
    fs.mkdirSync(target, { recursive: true });
    copyDir(PKG_ROOT, target, COPY_SKIP);
    if (!fs.existsSync(path.join(target, 'SKILL.md'))) {
      throw new InstallError('Installed directory is missing SKILL.md');
    }
  } catch (err) {
    if (err instanceof UsageError || err instanceof InstallError) throw err;
    throw new InstallError('Cannot install to ' + target + ': ' + err.message);
  }
  console.log('installed -> ' + target);
  return target;
}

function projectDirs() {
  return [
    '.claude/skills',
    '.cursor/skills',
    '.codex/skills',
    '.config/goose/skills',
    '.config/agents/skills',
    '.opencode/skills',
    '.codeium/windsurf/skills',
    '.workbuddy/skills',
    '.kiro/skills',
    '.traecli/skills',
    '.gemini/skills',
    '.trae-cn/skills',
    '.qwen/skills',
    '.comate/skills',
    '.codebuddy/skills',
    '.kimi/skills',
    '.agents/skills',
  ].filter((dir) => fs.existsSync(dir));
}

function run() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { usage(); return; }
  if (opts.list) { printList(); return; }

  if (opts.dir) { installTo(opts.dir); return; }

  if (opts.agent) {
    const info = AGENT_DIRS[opts.agent];
    if (!info) {
      throw new UsageError('Unknown agent: ' + opts.agent + '. Available: ' + Object.keys(AGENT_DIRS).join(', ') + '. Use --dir for a custom directory.');
    }
    installTo(resolveUserDir(info.dirs[0]));
    return;
  }

  if (opts.global) {
    const seen = new Set();
    let count = 0;
    for (const value of Object.values(AGENT_DIRS)) {
      for (const dir of value.dirs) {
        if (seen.has(dir)) continue;
        seen.add(dir);
        installTo(resolveUserDir(dir));
        count++;
      }
    }
    console.log('Installed to ' + count + ' directories.');
    return;
  }

  const dirs = projectDirs();
  if (!dirs.length) {
    throw new TargetError('No project-level agent directory detected. Use --agent <name> or --dir <path>.');
  }
  for (const dir of dirs) installTo(dir);
}

function main() {
  try {
    run();
  } catch (err) {
    if (err instanceof UsageError) {
      console.error('Usage error: ' + err.message);
      usage();
      process.exitCode = 2;
    } else if (err instanceof TargetError) {
      console.error('Target error: ' + err.message);
      process.exitCode = 4;
    } else if (err instanceof InstallError) {
      console.error('Install failed: ' + err.message);
      console.error('Fix: check directory permissions and free space, then retry. Use --dir to choose another directory.');
      process.exitCode = 1;
    } else {
      console.error('Unexpected error: ' + (err && err.message ? err.message : String(err)));
      process.exitCode = 1;
    }
  }
}

main();
