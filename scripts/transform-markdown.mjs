import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const inputPath = resolve(process.argv[2])
const raw = readFileSync(inputPath, "utf-8")
const lines = raw.split("\n")
const output = []
let inExamples = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const trimmed = line.trim()

  // 章节标题、条目标题、分类行原样保留
  if (
    trimmed.startsWith("# ") ||
    trimmed.startsWith("## ") ||
    trimmed.startsWith("- 分类：")
  ) {
    inExamples = false
    output.push(line)
    continue
  }

  // 跳过空行（由后续逻辑按需插入）
  if (!trimmed) {
    continue
  }

  // 用法：`...` → ==用法：...==
  if (trimmed.startsWith("- 用法：")) {
    const content = trimmed.slice("- 用法：".length)
    const stripped = content.replace(/^`/, "").replace(/`$/, "")
    output.push("")
    output.push(`==用法：${stripped}==`)
    output.push("")
    continue
  }

  // 说明（日文）/ 说明（中文） → 引用块
  if (trimmed.startsWith("- 说明（")) {
    const content = trimmed.slice(2)
    output.push("")
    output.push(`> ${content}`)
    output.push("")
    continue
  }

  // 相关文法 → 斜体
  if (trimmed.startsWith("- 相关文法：")) {
    const content = trimmed.slice(2)
    output.push("")
    output.push(`*${content}*`)
    output.push("")
    continue
  }

  // 例句：标记
  if (trimmed === "- 例句：") {
    inExamples = true
    output.push("")
    output.push("例句：")
    output.push("")
    continue
  }

  // 日文例句行（- 开头，非缩进）
  if (inExamples && trimmed.startsWith("- ") && !line.startsWith("  ")) {
    const content = trimmed.slice(2)
    output.push(`<u>${content}</u>`)
    continue
  }

  // 译文行（  - 译： 开头）
  if (trimmed.startsWith("- 译：")) {
    const content = trimmed.slice("- 译：".length)
    output.push(`译：${content}`)
    output.push("")
    continue
  }

  // 其他行原样保留
  output.push(line)
}

// 清理连续空行（最多保留一个）
let result = output.join("\n")
result = result.replace(/\n{3,}/g, "\n\n")

writeFileSync(inputPath, result, "utf-8")
console.log(`Done. ${lines.length} → ${result.split("\n").length} lines`)
