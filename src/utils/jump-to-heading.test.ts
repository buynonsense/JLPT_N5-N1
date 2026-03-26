import { describe, expect, it } from "vitest"

import { buildSmoothScrollFrames, calculateTargetScrollTop, findHeadingPosition, pickTargetLeaf } from "./jump-to-heading"


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


describe("buildSmoothScrollFrames", () => {
  it("returns multiple intermediate frames for short distances", () => {
    const frames = buildSmoothScrollFrames({
      startTop: 100,
      endTop: 280,
      steps: 14,
    })

    expect(frames).toHaveLength(14)
    expect(frames[0]).toBeGreaterThan(100)
    expect(frames[1]).toBeGreaterThan(frames[0])
    expect(frames[12]).toBeGreaterThan(frames[11])
    expect(frames[13]).toBe(280)
  })

  it("returns only the destination when distance is zero", () => {
    const frames = buildSmoothScrollFrames({
      startTop: 200,
      endTop: 200,
      steps: 4,
    })

    expect(frames).toEqual([200])
  })
})


describe("calculateTargetScrollTop", () => {
  it("uses editor-provided pixel coordinates instead of a fixed line height", () => {
    const result = calculateTargetScrollTop({
      lineTop: 960,
      viewportHeight: 600,
      offsetTop: 24,
    })

    expect(result).toBe(684)
  })

  it("never returns a negative scroll target", () => {
    const result = calculateTargetScrollTop({
      lineTop: 80,
      viewportHeight: 600,
      offsetTop: 24,
    })

    expect(result).toBe(0)
  })
})
