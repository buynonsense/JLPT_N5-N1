import { describe, expect, it } from "vitest"

import { findHeadingPosition } from "./jump-to-heading"


describe("findHeadingPosition", () => {
  it("finds the exact heading line for a grammar item", () => {
    const markdown = `# JLPT N5 文法整理

## 001. 〜は〜です ★★★
- 说明

## 002. 〜は〜では ありません ★★★
`

    const result = findHeadingPosition(markdown, "002. 〜は〜では ありません ★★★")
    expect(result).toEqual({ line: 6, column: 0 })
  })

  it("returns null when heading does not exist", () => {
    const result = findHeadingPosition("# JLPT N5 文法整理\n", "001. missing ★★★")
    expect(result).toBeNull()
  })
})
