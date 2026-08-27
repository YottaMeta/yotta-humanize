<p align="center"><b>Language</b>: <a href="./README.md">English</a> · 中文</p>


<p align="center">
  <img src="assets/banner.png" alt="yotta-humanize banner" width="100%" />
</p>

<h1 align="center">yotta-humanize · 元真</h1>

<p align="center">YottaMeta 自有的去 AI 味中文写作编辑技能：<b>检测器引擎（24 类规则 + 词表 + 统计突发性）</b>识别 AI 腔文本，并给出确定性改写，让中文写作更自然、更像人写的。适用于编辑 / 润色文本、给 AI 生成的中文稿件做检测与改写。</p>
<p align="center">检测到空泛升华、套话、AI 黑话（赋能 / 闭环 / 抓手）、同义堆叠、排比三连、聊天残渣（希望对你有所帮助）等 AI 腔特征时自动激活——<b>不靠提示词兜底，按规则确定性判定</b>。</p>
<p align="center">纯 Python 3.8+ 标准库实现，零外部依赖；Windows + Linux + macOS 通用；检测 + 改写全流程，改写不依赖模型。</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://agentskills.io/"><img alt="Standard: agentskills.io" src="https://img.shields.io/badge/standard-agentskills.io-orange" /></a>
  <a href="https://www.npmjs.com/package/@yottameta/yotta-humanize"><img alt="npm package" src="https://img.shields.io/npm/v/@yottameta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize"><img alt="GitHub stars" src="https://img.shields.io/github/stars/YottaMeta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize/commits/main"><img alt="last commit" src="https://img.shields.io/github/last-commit/YottaMeta/yotta-humanize" /></a>
  <a href="https://github.com/YottaMeta/yotta-humanize"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen" /></a>
</p>

## 这是什么

AI 生成的中文文本有一眼可辨的「AI 腔」：空泛升华（标志着 / 彰显了）、套话（众所周知 / 综上所述 / 未来可期）、黑话（赋能 / 闭环 / 抓手 / 颗粒度）、机械列举（首先 / 其次 / 再次）、聊天残渣（希望对你有所帮助）……元真把这些特征做成**确定性检测器引擎**：24 类规则（词表 + 句式正则）+ 中文统计突发性（句长均匀度 / 词汇多样性），输出 0-100 的 AI 腔评分，并给出**确定性改写**（词表替换、套话删除、聊天残渣清理、标点限流）。

它不是某个平台的专属功能，而是一份与智能体无关的工具包：装进任何支持 Agent Skills 的智能体即可按需调用。全程零依赖、不调模型；需要判断的改写以建议形式给出，不强行自动改。

## 核心价值

- **24 类检测规则**：内容（空泛升华 / 套话开头结尾 / 模糊归因 / 绝对化）/ 语言（AI 黑话 / 同义堆叠 / 名词化堆砌 / 「我们」滥用）/ 句式（排比三连 / 机械列举 / 反问堆叠 / 标点滥用）/ 沟通（聊天残渣 / 奉承讨好 / 免责回避）/ 废话（填充 / 转折 / 重复声明）。
- **统计突发性**：句长均匀度（CV）、突发性、双字词汇多样性（TTR）、逗号密度——补规则检测不到的节奏问题。
- **确定性改写**：无歧义机械变换直接改（赋能→支持、抓手→切入点、众所周知 / 综上所述 删除、希望对你有所帮助 清理、破折号 / 感叹号限流），输出修复清单与前后评分。
- **机器可读**：--json 输出纯净 JSON；score --gate 接入 CI / 发布前检查。
- **中文优先**：词表、句式、改写映射全部针对中文语料自研整理，与英文 humanizer 类技能无共享代码。

## 核心优势

| 优势 | 说明 |
|---|---|
| **零依赖** | Python 3.8+ 标准库，无模型、无数据库、无外部服务；Windows + Linux + macOS 通用 |
| **确定性** | 规则判定可复现、可解释；改写是确定性变换，不依赖模型概率 |
| **中文优先** | 针对中文 AI 腔（黑话 / 套话 / 排比 / 聊天残渣）自研词表与句式，非英文规则直译 |
| **检测 + 改写一体** | score / analyze / report / suggest / rewrite 全流程，一条命令从检测到改写 |
| **可复核** | 改写输出修复清单与前后评分，人工可逐条核对 |
| **生态分发** | GitHub + npm + ClawHub 三源同步发布；npx / install.sh / 手动复制三种安装方式 |

## 功能体系

| 能力 | 说明 |
|---|---|
| score | 输出 AI 腔评分（0-100），--gate 可做 CI 拦截（退出码 1） |
| analyze | 详细检测报告（文本 / --json），含命中规则、上下文片段、建议 |
| report | Markdown 检测报告（统计表 + 命中规则） |
| suggest | 按优先级分组的改写建议 |
| rewrite | 确定性改写：替换 / 删除 AI 腔，输出修复清单 + 改写后文本 + 前后评分 |
| version | 打印版本 |

## 快速使用

Windows 用 python，Linux/macOS 用 python3。

```bash
# 评分（0-100，越高越像 AI 写的）
python3 scripts/yotta_humanize.py score -f article.md

# 详细检测报告
python3 scripts/yotta_humanize.py analyze -f article.md

# Markdown 报告
python3 scripts/yotta_humanize.py report -f article.md > report.md

# 按优先级分组的改写建议
python3 scripts/yotta_humanize.py suggest -f article.md

# 确定性改写（输出改写后文本 + 修复清单）
python3 scripts/yotta_humanize.py rewrite -f article.md

# 管道输入
cat article.md | python3 scripts/yotta_humanize.py score --stdin

# CI 拦截：评分 >= 阈值时退出码 1
python3 scripts/yotta_humanize.py score -f article.md --gate --threshold 45
```

退出码语义（与元安 / 元审 / 元盾家族一致）：0 = 成功；1 = score --gate 且评分达到阈值；4 = 用法错误 / 致命异常。

## 安装

三种方式任选其一，技能文件统一从 **npm** 获取（GitHub 无代理时较慢，npm 可配国内镜像加速）。

### 方式一：npm（推荐，一行安装）
```bash
# 国内加速（可选）：npm config set registry https://registry.npmmirror.com
npx -y @yottameta/yotta-humanize -g
npx -y @yottameta/yotta-humanize --dir <你的技能目录>   # 任意智能体：指定目录安装
```
> 智能体不在预置列表里？用 --dir 指定它的 skills 目录，或手动复制（方式三）。--list 可查看各智能体对应的默认目录。想手动拿文件也可 npm pack @yottameta/yotta-humanize 解包后按方式二/三安装。

### 方式二：install.sh 一键安装
获取技能文件夹后（npm pack 解包或 git clone），进入技能文件夹：
```bash
bash install.sh -g    # 用户级；bash install.sh --list 查看全部目录
bash install.sh --agent codex   # 指定智能体（--list 可查看可用项）
bash install.sh       # 项目级：自动检测已存在的 .claude/.cursor/.codex 等 skills 目录
bash install.sh --dir /path/to/skills
```
> 覆盖 17 类智能体，含国内 Trae / Qwen / Comate / CodeBuddy / Kimi。Windows 用户：装有 Git Bash 即可用；否则用方式三手动复制。

### 方式三：手动复制
把整个 yotta-humanize 文件夹复制到目标智能体的 skills 目录。常见位置（用户级；Windows 用 %USERPROFILE%，Linux/macOS 用 ~）：

| 智能体 | 用户级目录 | 项目级目录 |
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
| Trae IDE（国内） | %USERPROFILE%\.trae-cn\skills\yotta-humanize\ | .trae\skills\ |
| Qwen Code | %USERPROFILE%\.qwen\skills\yotta-humanize\ | .qwen\skills\ |
| Comate | %USERPROFILE%\.comate\skills\yotta-humanize\ | .comate\skills\ |
| CodeBuddy | %USERPROFILE%\.codebuddy\skills\yotta-humanize\ | .codebuddy\skills\ |
| Kimi | %USERPROFILE%\.kimi\skills\yotta-humanize\ | .kimi\skills\ |
| 通用 AGENTS.md | %USERPROFILE%\.agents\skills\yotta-humanize\ | .agents\skills\ |

> Codex 默认目录若设置了环境变量 CODEX_HOME，以该变量为准；opencode 若设置 XDG_CONFIG_HOME 同理。.agents\skills 并非通用目录，仅 OpenCode / Cursor / Cline / Amp / Kimi / Gemini CLI / GitHub Copilot 等会读取，Claude Code 与 Codex 默认不读。不确定时用 --dir 指定，或让该智能体自行安装。

## 使用示例（AI 智能体）

1. 将本仓库的 SKILL.md 接入任意 AI 智能体的技能/规则系统（见上方安装）。
2. 收到一段 AI 味很重的文稿时，先跑一次检测：
   ```bash
   python3 scripts/yotta_humanize.py analyze -f draft.md
   ```
   看评分与命中规则（空泛升华 / 黑话 / 套话 / 聊天残渣等）。
3. 无歧义的部分直接机械改写：
   ```bash
   python3 scripts/yotta_humanize.py rewrite -f draft.md
   ```
   对照修复清单确认，把改写后文本落回稿件。
4. 需要判断的部分（排比拆句、模糊归因补来源、绝对化软化）按 suggest 的建议手工润色。
5. 改写完再 score 一次，确认评分下降、原意未破坏。

## 开发与校验

- 测试：python scripts/test_yotta_humanize.py（155 项）
- 基础校验：python tools/validate-skill.py yotta-humanize（在仓库根目录运行）
- 规则目录：references/patterns.md；评分公式：references/scoring.md；改写规则：references/rewriting.md

## 许可证

MIT © YottaMeta —— 详见 [LICENSE](./LICENSE)。
