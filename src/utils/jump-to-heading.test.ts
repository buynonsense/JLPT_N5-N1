import { describe, expect, it } from "vitest"

import { findHeadingPosition, pickTargetLeaf } from "./jump-to-heading"


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


describe("pickTargetLeaf", () => {
  it("reuses the active leaf when it already shows the grammar document", () => {
    const activeLeaf = {
      view: {
        file: { path: "JLPT/jlpt文法n5_to_n1.md" },
      },
    }
    const fallbackLeaf = { view: { file: { path: "other.md" } } }

    const result = pickTargetLeaf({
      activeLeaf,
      markdownLeaves: [fallbackLeaf],
      sourceDocPath: "JLPT/jlpt文法n5_to_n1.md",
    })

    expect(result).toBe(activeLeaf)
  })

  it("reuses an existing markdown leaf that already opened the grammar document", () => {
    const existingLeaf = {
      view: {
        file: { path: "JLPT/jlpt文法n5_to_n1.md" },
      },
    }
    const activeLeaf = { view: { file: { path: "other.md" } } }

    const result = pickTargetLeaf({
      activeLeaf,
      markdownLeaves: [activeLeaf, existingLeaf],
      sourceDocPath: "JLPT/jlpt文法n5_to_n1.md",
    })

    expect(result).toBe(existingLeaf)
  })

  it("returns null when no open leaf already matches the grammar document", () => {
    const activeLeaf = { view: { file: { path: "other.md" } } }

    const result = pickTargetLeaf({
      activeLeaf,
      markdownLeaves: [activeLeaf],
      sourceDocPath: "JLPT/jlpt文法n5_to_n1.md",
    })

    expect(result).toBeNull()
  })

  it("prefers the provided preferred leaf over another matching markdown leaf", () => {
    const preferredLeaf = {
      view: {
        file: { path: "JLPT/jlpt文法n5_to_n1.md" },
      },
    }
    const existingLeaf = {
      view: {
        file: { path: "JLPT/jlpt文法n5_to_n1.md" },
      },
    }
    const activeLeaf = { view: { file: { path: "other.md" } } }

    const result = pickTargetLeaf({
      activeLeaf,
      preferredLeaf,
      markdownLeaves: [existingLeaf, preferredLeaf],
      sourceDocPath: "JLPT/jlpt文法n5_to_n1.md",
    })

    expect(result).toBe(preferredLeaf)
  })
})
