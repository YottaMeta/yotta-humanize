# 更新日志

## v0.1.0 (2026-08-26)

YottaMeta 自有实现首版（去 AI 味方向参考开源社区 humanizer / ai-humanizer 类技能思路，已完全重写为中文语料实现，零依赖、无上游代码）：

- **检测器引擎**（scripts/yotta_humanize.py + humanize_rules.py，Python 3.8+ 标准库）：24 类中文 AI 腔规则（内容 / 语言 / 句式 / 沟通 / 废话五组）+ 词表 + 句式正则 + 统计突发性（句长均匀度 CV / 突发性 / 双字词汇多样性 TTR / 逗号密度）。
- **确定性改写**：词表替换（赋能→支持、抓手→切入点、闭环→流程…）、套话 / 聊天残渣 / 奉承 / 免责删除、破折号 / 感叹号限流；输出修复清单与前后评分。
- **CLI**：score（--gate 可做 CI 拦截）/ analyze / report（Markdown）/ suggest / rewrite / version；--json 机器可读；stdin 编码自适应（UTF-8 优先，回退本机编码）。
- **退出码**：与元安 / 元审 / 元盾家族一致（0 = 成功；1 = --gate 达到阈值；4 = 用法错误）。
- **测试**：scripts/test_yotta_humanize.py 155 项全绿（24 类规则命中 / 干净文本低分 / 统计量 / 确定性改写 / CLI 子命令 / 退出码 / JSON / GBK 控制台）。
- **文档**：SKILL.md / README.md / references（patterns / scoring / rewriting）/ assets/banner.png。
- 版权：YottaMeta 纯自有 MIT + NOTICE 品牌声明；README 一行上游致谢。
