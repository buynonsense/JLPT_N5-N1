import { describe, expect, it } from "vitest"

import { parseJLPTMarkdown } from "./jlpt-markdown-parser"


describe("parseJLPTMarkdown", () => {
  it("extracts grammar items and metadata", () => {
    const markdown = `# JLPT N5-N1 文法总整理

# JLPT N5 文法整理

## 009. 〜は〜ですか ★★★
- 用法：\`名詞1は + 名詞2です\`

## 010. 〜は〜でしたか ★★★
- 分类：N5疑問
`

    const items = parseJLPTMarkdown(markdown)

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      id: "N5-009",
      level: "N5",
      order: 9,
      globalIndex: 1,
      title: "〜は〜ですか",
      stars: "★★★",
      headingText: "009. 〜は〜ですか ★★★",
      sectionHeading: "JLPT N5 文法整理",
      tag: null,
    })
    expect(items[1]).toMatchObject({
      id: "N5-010",
      tag: "N5疑問",
    })
  })

  it("throws with line number for invalid section heading", () => {
    expect(() => parseJLPTMarkdown("# Not JLPT\n")).toThrow(/line=1/)
  })

  it("throws with line number for invalid item heading", () => {
    const markdown = `# JLPT N5 文法整理

## bad heading
`
    expect(() => parseJLPTMarkdown(markdown)).toThrow(/line=3/)
  })

  it("throws for duplicate ids", () => {
    const markdown = `# JLPT N5 文法整理

## 009. 〜は〜ですか ★★★

## 009. 〜は〜でしたか ★★★
`
    expect(() => parseJLPTMarkdown(markdown)).toThrow(/duplicate id/i)
  })
})
