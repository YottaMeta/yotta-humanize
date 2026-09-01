## v0.1.3 (2026-09-01)

评测反馈优化（文档 + 错误提示，功能不变）。

- 错误提示友好化：`-f` 文件不存在 / 不是 UTF-8 编码 / 无读取权限时，给出中文修复建议（不再抛英文堆栈）；运行时兜底错误附「修复建议」。
- 新增 `references/faq.md`：10 条常见问题 / 避坑（传文本方式、编码、长文分段、结果不符合预期、rewrite vs suggest、CI gate、退出码、改动核对、检测原理、边界）。
- README 中英：新增「效果展示（改写前后）」「错误处理」「常见问题 FAQ 速查」。
- SKILL.md：新增「常见问题 FAQ（速查）」小节，指向 references/faq.md。
- 版本四件对齐 0.1.3（package.json / SKILL.md / CHANGELOG / 引擎 VERSION）。

# 更新日志

## v0.1.2 (2026-08-29)

- 安装方式统一为四方式（对齐发布规范 §3.3.1）：方式一 `npx -y @yottameta/yotta-humanize --agent <name>` / `--dir <dir>`（推荐，走 npm 源）；方式二 `git clone https://github.com/YottaMeta/yotta-humanize.git`；方式三 GitHub Download ZIP；方式四 `bash install.sh --agent/--dir/--list`。移除 `npx skills` 与 `-g` 推荐；中英双 README 安装节同步。
- 版本对齐：package.json / SKILL.md / CHANGELOG / 引擎 VERSION / 测试断言 / README 锚点 = 0.1.2。
- 无功能变更（仅文档与版本同步）。

## v0.1.1 (2026-08-28)

中英双语 README 对齐（确定「英文门面 + 中文全档」）：

- **README.md 改为英文**：作为 GitHub / npm / ClawHub 首页的英文门面（翻译 + 精简，覆盖定位 / 核心价值 / 命令 / 快速使用 / 安装 / 使用示例 / 边界 / 开发校验全流程）。
- **新增 README.zh-CN.md**：原中文完整主文档整体平移，顶部加语言切换链接。
- **package.json**：description 改英文；files 加 README.zh-CN.md；版本 0.1.0 → 0.1.1。
- 版本四处对齐：package.json / SKILL frontmatter / 引擎 VERSION / 文档。
- 边界（B 方案）：references / CHANGELOG / 测试注释不翻译；SKILL 触发描述保持中文。

## v0.1.0 (2026-08-26)

YottaMeta 自有实现首版（去 AI 味方向参考开源社区 humanizer / ai-humanizer 类技能思路，已完全重写为中文语料实现，零依赖、完全自研）：

- **检测器引擎**（scripts/yotta_humanize.py + humanize_rules.py，Python 3.8+ 标准库）：24 类中文 AI 腔规则（内容 / 语言 / 句式 / 沟通 / 废话五组）+ 词表 + 句式正则 + 统计突发性（句长均匀度 CV / 突发性 / 双字词汇多样性 TTR / 逗号密度）。
- **确定性改写**：词表替换（赋能→支持、抓手→切入点、闭环→流程…）、套话 / 聊天残渣 / 奉承 / 免责删除、破折号 / 感叹号限流；输出修复清单与前后评分。
- **CLI**：score（--gate 可做 CI 拦截）/ analyze / report（Markdown）/ suggest / rewrite / version；--json 机器可读；stdin 编码自适应（UTF-8 优先，回退本机编码）。
- **退出码**：与元安 / 元审 / 元盾家族一致（0 = 成功；1 = --gate 达到阈值；4 = 用法错误）。
- **测试**：scripts/test_yotta_humanize.py 155 项全绿（24 类规则命中 / 干净文本低分 / 统计量 / 确定性改写 / CLI 子命令 / 退出码 / JSON / GBK 控制台）。
- **文档**：SKILL.md / README.md / references（patterns / scoring / rewriting）/ assets/banner.png。
- 版权：YottaMeta 纯自有 MIT + NOTICE 品牌声明；README 一行来源致谢。
