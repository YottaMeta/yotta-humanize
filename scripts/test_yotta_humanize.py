#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""test_yotta_humanize.py — 元真（yotta-humanize）测试。

覆盖：24 类规则命中 / 干净文本低分 / 统计量 / 确定性改写 / CLI 子命令 /
退出码 / JSON 输出 / 控制台编码。纯标准库，无 pytest 依赖。

运行：python scripts/test_yotta_humanize.py
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

import humanize_rules as HR  # noqa: E402
import yotta_humanize as YH  # noqa: E402

PASS = 0
FAIL = 0
FAILED = []


def check(name, cond, detail=""):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        FAILED.append(name)
        print("  FAIL: %s %s" % (name, detail))


def detect_ids(text):
    return [f["rule_id"] for f in YH.detect(text)]


def test_rules_table():
    ids = [r["id"] for r in HR.RULES]
    check("规则数量 = 24", len(HR.RULES) == 24, "got %d" % len(HR.RULES))
    check("规则 id 唯一", len(ids) == len(set(ids)))
    check("规则 id 命名 HZ-01..HZ-24",
          ids == ["HZ-%02d" % i for i in range(1, 25)], str(ids))
    for r in HR.RULES:
        check("规则 %s 字段齐全" % r["id"],
              all(k in r for k in ("id", "name", "group", "weight",
                                   "regexes", "words", "suggestion")),
              str(r.keys()))
        check("规则 %s group 合法" % r["id"], r["group"] in HR.GROUPS)
        check("规则 %s weight 1-5" % r["id"], 1 <= r["weight"] <= 5)
        check("规则 %s 有检测手段" % r["id"],
              bool(r["regexes"]) or bool(r["words"]))


def test_detect_24():
    cases = [
        ("HZ-01", "这一举措标志着新时代的到来，意义重大。"),
        ("HZ-02", "随着人工智能技术的发展，很多行业都变了。"),
        ("HZ-03", "综上所述，未来可期，让我们拭目以待。"),
        ("HZ-04", "说白了，这件事并不难。"),
        ("HZ-05", "专家指出，长期熬夜有害健康。"),
        ("HZ-06", "毫无疑问，这个方案一定会成功。"),
        ("HZ-07", "我们要给业务赋能，找到真正的抓手。"),
        ("HZ-08", "这个问题非常非常重要。"),
        ("HZ-09", "我们需要完善和优化现有流程。"),
        ("HZ-10", "我们坚信明天会更好。"),
        ("HZ-11", "问题的解决需要时间。"),
        ("HZ-12", "我们要更加深入地理解需求。"),
        ("HZ-13", "它不仅速度快，而且很稳定，更让人放心。"),
        ("HZ-14", "首先，我们要准备。其次，我们要行动。"),
        ("HZ-15", "难道不是最好的选择吗？"),
        ("HZ-16", "第一段——第二段——第三段——第四段。"),
        ("HZ-17", "这就是所谓的“赋能”。"),
        ("HZ-18", "太好了！真棒！加油！"),
        ("HZ-19", "希望对你有所帮助。"),
        ("HZ-20", "很好的问题。答案很简单。"),
        ("HZ-21", "限于篇幅，这里不再赘述。"),
        ("HZ-22", "其实，这事很简单。"),
        ("HZ-23", "话说回来，还是要小心。"),
        ("HZ-24", "值得注意的是，价格在上涨。"),
    ]
    for rid, text in cases:
        got = detect_ids(text)
        check("命中 %s" % rid, rid in got, "text=%r got=%s" % (text, got))


def test_clean_text_low_score():
    clean = ("我们上周把接口切到了新网关，压测 5000 并发没有报错。"
             "旧方案在凌晨会偶发超时，查了三天日志，最后发现是连接池太小。"
             "这周先观察线上，再决定要不要调参数。")
    res = YH.analyze(clean)
    check("干净文本评分 < 20", res["score"] < 20, "score=%d" % res["score"])
    check("干净文本规则命中少", res["rule_types"] <= 1,
          "rules=%s" % [f["rule_id"] for f in res["findings"]])


def test_ai_text_high_score():
    ai = ("众所周知，随着人工智能技术的飞速发展，各行各业都在发生深刻变革。"
          "这一举措标志着新时代的到来，意义重大，充分体现了我们的价值。"
          "我们要给业务赋能，找到抓手，形成闭环。"
          "首先，我们要完善和优化流程。其次，我们要加强和完善团队建设。"
          "专家指出，未来可期。值得注意的是，我们坚信明天会更好。"
          "希望对你有所帮助。")
    res = YH.analyze(ai)
    check("AI 文本评分 >= 45", res["score"] >= 45, "score=%d" % res["score"])
    check("AI 文本多类命中", res["rule_types"] >= 8,
          "rules=%d" % res["rule_types"])


def test_stats():
    uniform = "今天天气很好。明天天气也很好。后天天气依然很好。"
    varied = ("昨晚下雨了。"
              "雨停之后我下楼，看见小区门口那棵老槐树被风刮断了一根大枝，"
              "横在路中间，几个保安正拿锯子一点点把它锯开。")
    su = YH.compute_stats(uniform)
    sv = YH.compute_stats(varied)
    check("均匀文本 CV < 起伏文本 CV", su["cv"] < sv["cv"],
          "%s vs %s" % (su["cv"], sv["cv"]))
    check("起伏文本突发性 >= 均匀文本", sv["burstiness"] >= su["burstiness"],
          "%s vs %s" % (sv["burstiness"], su["burstiness"]))
    check("stats_score 短文本为 0", YH.stats_score(
        YH.compute_stats("很短。")) == 0)


def test_rewrite_mechanical():
    r = YH.rewrite("众所周知，AI 很重要。综上所述，未来可期。希望对你有所帮助。")
    for bad in ("众所周知", "综上所述", "未来可期", "希望对你有所帮助"):
        check("改写删除「%s」" % bad, bad not in r["text"],
              "text=%r" % r["text"])
    check("改写有 fixes 记录", len(r["fixes"]) >= 3, str(r["fixes"]))

    r2 = YH.rewrite("我们要给业务赋能，找到抓手。")
    check("改写黑话 赋能→支持", "赋能" not in r2["text"] and "支持" in r2["text"],
          "text=%r" % r2["text"])
    check("改写黑话 抓手→切入点", "抓手" not in r2["text"] and "切入点" in r2["text"],
          "text=%r" % r2["text"])

    r3 = YH.rewrite("第一段——第二段——第三段——第四段。")
    check("改写破折号限 2 处", r3["text"].count("——") <= 2,
          "text=%r" % r3["text"])

    r4 = YH.rewrite("太好了！真棒！加油！")
    check("改写感叹号限 2 处", r4["text"].count("！") <= 2,
          "text=%r" % r4["text"])

    r5b = YH.rewrite("我们要形成完整闭环。")
    check("改写闭环不重复「完整」", "完整完整" not in r5b["text"],
          "text=%r" % r5b["text"])

    r5 = YH.rewrite("我们需要完善和优化流程。")
    check("改写同义堆叠", "完善和优化" not in r5["text"],
          "text=%r" % r5["text"])

    # 改写后评分应下降（AI 腔文本）
    ai = ("众所周知，随着人工智能技术的飞速发展，各行各业都在发生深刻变革。"
          "这一举措标志着新时代的到来，意义重大。"
          "我们要给业务赋能，找到抓手，形成闭环。"
          "专家指出，未来可期。值得注意的是，我们坚信明天会更好。"
          "希望对你有所帮助。")
    r6 = YH.rewrite(ai)
    check("改写后评分下降", r6["after"] < r6["before"],
          "before=%d after=%d" % (r6["before"], r6["after"]))


def _run(args, inp=None):
    return subprocess.run([sys.executable, str(_HERE / "yotta_humanize.py")] + args,
                          input=inp, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")


def test_cli():
    ai = "众所周知，未来可期。我们希望对你有所帮助。"
    r = _run(["score"], inp=ai)
    check("score 文本输出为数字", r.returncode == 0 and r.stdout.strip().isdigit(),
          "rc=%d out=%r" % (r.returncode, r.stdout))

    r = _run(["score", "--gate", "--threshold", "1"], inp=ai)
    check("score --gate 高分退出码 1", r.returncode == 1, "rc=%d" % r.returncode)

    r = _run(["score", "--gate", "--threshold", "99"], inp=ai)
    check("score --gate 低分退出码 0", r.returncode == 0, "rc=%d" % r.returncode)

    r = _run(["score", "--json"], inp=ai)
    try:
        obj = json.loads(r.stdout)
        check("score --json 可解析且含 score",
              r.returncode == 0 and "score" in obj, r.stdout[:80])
    except Exception as e:  # noqa: BLE001
        check("score --json 可解析", False, str(e))

    with tempfile.TemporaryDirectory() as td:
        f = Path(td) / "article.txt"
        f.write_text(ai, encoding="utf-8")
        r = _run(["analyze", "-f", str(f)])
        check("analyze -f 输出含评分", r.returncode == 0 and "评分" in r.stdout,
              "rc=%d" % r.returncode)
        r = _run(["report", "-f", str(f)])
        check("report -f 输出 markdown 标题",
              r.returncode == 0 and r.stdout.startswith("# AI 腔检测报告"),
              "rc=%d head=%r" % (r.returncode, r.stdout[:40]))
        r = _run(["suggest", "-f", str(f)])
        check("suggest -f 输出建议", r.returncode == 0 and "建议" in r.stdout,
              "rc=%d" % r.returncode)
        r = _run(["rewrite", "-f", str(f)])
        check("rewrite -f 输出修复与文本",
              r.returncode == 0 and "改写后评分" in r.stdout,
              "rc=%d" % r.returncode)
        r = _run(["rewrite", "--json", "-f", str(f)])
        try:
            obj = json.loads(r.stdout)
            check("rewrite --json 含 text/fixes",
                  "text" in obj and "fixes" in obj and "after" in obj,
                  r.stdout[:80])
        except Exception as e:  # noqa: BLE001
            check("rewrite --json 可解析", False, str(e))

    r = _run(["analyze", "-f", "不存在的文件.txt"])
    check("analyze 缺文件退出码 4", r.returncode == 4, "rc=%d" % r.returncode)

    r = _run(["version"])
    check("version 输出版本", r.returncode == 0 and YH.VERSION in r.stdout,
          "rc=%d out=%r" % (r.returncode, r.stdout))

    r = _run(["badcmd"])
    check("未知子命令退出码 2（argparse）", r.returncode == 2,
          "rc=%d" % r.returncode)


def test_gbk_console():
    # Windows GBK 控制台：引擎 stdout 已重配 UTF-8，中文输出不报错
    ai = "众所周知，未来可期。"
    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "gbk"
    r = subprocess.run(
        [sys.executable, str(_HERE / "yotta_humanize.py"), "score"],
        input=ai, capture_output=True, text=True, encoding="gbk",
        errors="replace", env=env)
    check("GBK 控制台中文输出不炸", r.returncode == 0, "rc=%d err=%r" % (r.returncode, r.stderr[:100]))


def main():
    print("元真（yotta-humanize）测试开始…")
    test_rules_table()
    test_detect_24()
    test_clean_text_low_score()
    test_ai_text_high_score()
    test_stats()
    test_rewrite_mechanical()
    test_cli()
    test_gbk_console()
    print("")
    print("通过 %d 项，失败 %d 项" % (PASS, FAIL))
    if FAILED:
        print("失败清单：")
        for name in FAILED:
            print("  - " + name)
    sys.exit(1 if FAIL else 0)


if __name__ == "__main__":
    main()
