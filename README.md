<p align="center"><b>Language</b>: English · <a href="./README.zh-CN.md">中文</a></p>

<p align="center">
  <img src="assets/banner.png" alt="yotta-humanize banner" width="100%" />
</p>

<h1 align="center">yotta-humanize · 元真 (Yuanzhen)</h1>

<p align="center">YottaMeta's AI-flavor remover for Chinese writing: a <b>detector engine (24 rule classes + wordlists + statistical burstiness)</b> that identifies AI-typical text and applies <b>deterministic rewrites</b> to make Chinese copy read more naturally, more like a human wrote it. Use it to edit / polish text or to detect and rewrite AI-generated Chinese drafts.</p>
<p align="center">Activates when it detects AI-flavor patterns — empty uplift, clichés, AI jargon (赋能 / 闭环 / 抓手), synonym stacking, triple parallel constructions, chat residue (希望对你有所帮助) — <b>deterministic verdicts by rules, not prompt-engineering luck</b>.</p>
<p align="center">Pure Python 3.8+ standard library, zero external dependencies; Windows + Linux + macOS; detection + rewriting in one flow, rewriting does not depend on any model.</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://agentskills.io/"><img alt="Standard: agentskills.io" src="https://img.shields.io/badge/standard-agentskills.io-orange" /></a>
  <a href="https://www.npmjs.com/package/@yottameta/yotta-humanize"><img alt="npm package" src="https://img.shields.io/npm/v/@yottameta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize"><img alt="GitHub stars" src="https://img.shields.io/github/stars/YottaMeta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize/commits/main"><img alt="last commit" src="https://img.shields.io/github/last-commit/YottaMeta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen" /></a>
</p>

## What it is

AI-generated Chinese text has a recognizable "AI flavor": empty uplift (标志着 / 彰显了), clichés (众所周知 / 综上所述 / 未来可期), jargon (赋能 / 闭环 / 抓手 / 颗粒度), mechanical enumeration (首先 / 其次 / 再次), chat residue (希望对你有所帮助)… Yuanzhen packages these signals into a **deterministic detector engine**: 24 rule classes (wordlists + sentence-pattern regexes) plus Chinese statistical burstiness (sentence-length uniformity / vocabulary diversity), outputting a 0-100 AI-flavor score and **deterministic rewrites** (wordlist substitution, cliché removal, chat-residue cleanup, punctuation throttling).

It is not tied to any single platform: an agent-agnostic toolkit that works in any agent supporting Agent Skills. Fully zero-dependency, no model calls; rewrites that need judgment are given as suggestions rather than forced automatically.

## Core value

- **24 detection rule classes** — content (empty uplift / cliché openers-closers / vague attribution / absolutism), language (AI jargon / synonym stacking / noun pile-ups / "we" overuse), sentence style (triple parallel / mechanical enumeration / rhetorical-question piles / punctuation abuse), communication (chat residue / flattery / disclaimer avoidance), filler (padding / transitions / repeated statements).
- **Statistical burstiness** — sentence-length uniformity (CV), burstiness, two-character vocabulary diversity (TTR), comma density — catches rhythm problems rules cannot see.
- **Deterministic rewriting** — unambiguous mechanical transforms are applied directly (赋能→支持, 抓手→切入点, 众所周知 / 综上所述 deleted, 希望对你有所帮助 cleaned, dash / exclamation throttled), outputting a fix list and before/after scores.
- **Machine readable** — --json outputs pure JSON; score --gate plugs into CI / pre-release checks.
- **Chinese-first** — wordlists, sentence patterns and rewrite mappings are all curated for Chinese text; no shared code with English humanizer-style skills.

## Why use it

| Advantage | Description |
|---|---|
| **Zero dependency** | Python 3.8+ standard library; no model / database / external service; Windows + Linux + macOS |
| **Deterministic** | Verdicts are reproducible and explainable; rewrites are deterministic transforms, not model probability |
| **Chinese-first** | Wordlists and patterns for Chinese AI-flavor (jargon / clichés / parallelism / chat residue) curated from scratch, not translated English rules |
| **Detect + rewrite in one** | score / analyze / report / suggest / rewrite — one command from detection to rewriting |
| **Reviewable** | Rewrites output a fix list and before/after scores so humans can verify item by item |
| **Ecosystem distribution** | GitHub + npm + ClawHub synced; install via npx / install.sh / manual copy |

## Commands

| Command | Description |
|---|---|
| score | AI-flavor score (0-100); --gate makes a CI gate (exit code 1) |
| analyze | Detailed detection report (text / --json) with matched rules, context snippets, suggestions |
| report | Markdown detection report (statistics table + matched rules) |
| suggest | Rewrite suggestions grouped by priority |
| rewrite | Deterministic rewrite: replace / remove AI-flavor, output fix list + rewritten text + before/after scores |
| version | Print the version |

## Quick start

Windows uses python, Linux/macOS uses python3.

```bash
# Score (0-100, higher = more AI-like)
python3 scripts/yotta_humanize.py score -f article.md

# Detailed detection report
python3 scripts/yotta_humanize.py analyze -f article.md

# Markdown report
python3 scripts/yotta_humanize.py report -f article.md > report.md

# Rewrite suggestions grouped by priority
python3 scripts/yotta_humanize.py suggest -f article.md

# Deterministic rewrite (outputs rewritten text + fix list)
python3 scripts/yotta_humanize.py rewrite -f article.md

# Pipe input
cat article.md | python3 scripts/yotta_humanize.py score --stdin

# CI gate: exit code 1 when score >= threshold
python3 scripts/yotta_humanize.py score -f article.md --gate --threshold 45
```

Exit codes (same semantics as the YuanAn / YuanShen / Yuandun family): **0** = success; **1** = score --gate and threshold reached; **4** = usage error / fatal exception.

## Install

Pick any one of the three methods; skill files are fetched from **npm** (GitHub is slower without a proxy; npm can use a domestic mirror).

### Method 1: npm (recommended, one-liner)
```bash
# domestic mirror (optional): npm config set registry https://registry.npmmirror.com
npx -y @yottameta/yotta-humanize -g
npx -y @yottameta/yotta-humanize --dir <your-skills-dir>   # any agent: install to a specific directory
```
> Not in the preset list? Use --dir to point at the agent's skills directory, or manual copy (method 3). --list shows each agent's default directory. You can also npm pack @yottameta/yotta-humanize and unpack it to install via method 2 / 3.

### Method 2: install.sh one-shot
After obtaining the skill folder (npm pack unpack or git clone), enter the folder:
```bash
bash install.sh -g    # user level; bash install.sh --list shows all directories
bash install.sh --agent codex   # specific agent (--list shows available ones)
bash install.sh       # project level: auto-detect existing .claude/.cursor/.codex skills dirs
bash install.sh --dir /path/to/skills
```
> Covers 17 agent families including Trae / Qwen / Comate / CodeBuddy / Kimi. Windows users: works with Git Bash; otherwise use method 3.

### Method 3: manual copy
Copy the whole yotta-humanize folder into the target agent's skills directory. Common locations (user level; Windows uses %USERPROFILE%, Linux/macOS uses ~):

| Agent | User-level directory | Project-level directory |
|---|---|---|
| Codex | %USERPROFILE%\.codex\skills\yotta-humanize\ | .codex\skills\ |
| Claude Code | %USERPROFILE%\.claude\skills\yotta-humanize\ | .claude\skills\ |
| Cursor | %USERPROFILE%\.cursor\skills\yotta-humanize\ | .cursor\skills\ |
| Windsurf | %USERPROFILE%\.codeium\windsurf\skills\yotta-humanize\ | .windsurf\skills\ |
| opencode | %USERPROFILE%\.config\opencode\skills\yotta-humanize\ | .opencode\skills\ |
| Gemini | %USERPROFILE%\.gemini\skills\yotta-humanize\ | .gemini\skills\ |
| Goose | %USERPROFILE%\.config\goose\skills\yotta-humanize\ | .goose\skills\ |
| Amp | %USERPROFILE%\.config\agents\skills\yotta-humanize\ | .agents\skills\ |
| Kiro | %USERPROFILE%\.kiro\skills\yotta-humanize\ | .kiro\skills\ |
| WorkBuddy | %USERPROFILE%\.workbuddy\skills\yotta-humanize\ | .workbuddy\skills\ |
| Trae Code CLI | %USERPROFILE%\.traecli\skills\yotta-humanize\ | .traecli\skills\ |
| Trae IDE (CN) | %USERPROFILE%\.trae-cn\skills\yotta-humanize\ | .trae\skills\ |
| Qwen Code | %USERPROFILE%\.qwen\skills\yotta-humanize\ | .qwen\skills\ |
| Comate | %USERPROFILE%\.comate\skills\yotta-humanize\ | .comate\skills\ |
| CodeBuddy | %USERPROFILE%\.codebuddy\skills\yotta-humanize\ | .codebuddy\skills\ |
| Kimi | %USERPROFILE%\.kimi\skills\yotta-humanize\ | .kimi\skills\ |
| Generic AGENTS.md | %USERPROFILE%\.agents\skills\yotta-humanize\ | .agents\skills\ |

> If Codex's CODEX_HOME is set, it overrides the default; the same applies to opencode's XDG_CONFIG_HOME. .agents\skills is not a universal directory — only OpenCode / Cursor / Cline / Amp / Kimi / Gemini CLI / GitHub Copilot etc. read it; **Claude Code and Codex do not read it by default**. When unsure, use --dir or let the agent install it.

## Usage examples (AI agent)

1. Hook this repo's SKILL.md into any AI agent's skill/rule system (see install above).
2. When you receive a heavily AI-flavored draft, run a detection first:
   ```bash
   python3 scripts/yotta_humanize.py analyze -f draft.md
   ```
   Check the score and matched rules (empty uplift / jargon / clichés / chat residue, etc.).
3. Apply direct mechanical rewrites for the unambiguous parts:
   ```bash
   python3 scripts/yotta_humanize.py rewrite -f draft.md
   ```
   Review against the fix list and write the rewritten text back into the draft.
4. For parts that need judgment (splitting parallel constructions, adding sources for vague attribution, softening absolutism), polish by hand following the suggest output.
5. After rewriting, score once more to confirm the score dropped and the original meaning is intact.

## Boundaries

- **Text-only, no generation** — it edits existing text; it does not create new content, and it does not alter facts / data / proper nouns against the author's intent.
- **Rewrites are suggestions** — unambiguous transforms apply directly; judgment-heavy rewrites are listed as suggestions for the human to confirm.
- **No model dependency** — deterministic rules only; results are reproducible and explainable.

## Development & validation

- Tests: python scripts/test_yotta_humanize.py (155 tests; Windows: python)
- Base validation: python tools/validate-skill.py yotta-humanize (run at the repo root)
- Rule catalog: references/patterns.md; scoring formula: references/scoring.md; rewriting rules: references/rewriting.md

Keep tests green and bump the version before releasing changes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE) © YottaMeta. "Yuanzhen" / "yotta-humanize" and the YottaMeta family names (yotta-* prefix) are YottaMeta brand identifiers; derived works must not reuse them, see [NOTICE](./NOTICE). The de-AI-flavor direction references open-source humanizer-style skills; the implementation is YottaMeta's own Chinese-corpus code.
