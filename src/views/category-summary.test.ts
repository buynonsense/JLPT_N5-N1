import { describe, expect, it } from "vitest"

import { buildCategorySummaries, findNextCategoryToStudy } from "./study-view-logic"
import type { GrammarIndexItem } from "../parser/jlpt-markdown-parser"


function makeItem(
  id: string,
  category: GrammarIndexItem["teachingCategory"],
  categoryOrder: number,
): GrammarIndexItem {
  return {
    id,
    level: id.slice(0, 2) as GrammarIndexItem["level"],
    order: Number(id.slice(3)),
    globalIndex: 1,
    title: id,
    stars: "★★★",
    tag: null,
    teachingCategory: category,
    categoryOrder,
    headingText: id,
    sectionHeading: "section",
    lineStart: 1,
  }
}


describe("category summaries", () => {
  it("builds per-category totals, progress and next level", () => {
    const summaries = buildCategorySummaries(
      [
        makeItem("N4-001", "条件", 2401),
        makeItem("N5-002", "条件", 2402),
        makeItem("N5-001", "原因", 1201),
      ],
      { "N5-002": true },
    )

    expect(summaries[0]).toMatchObject({
      category: "原因",
      total: 1,
      done: 0,
      nextLevel: "N5",
    })
    expect(summaries[1]).toMatchObject({
      category: "条件",
      total: 2,
      done: 1,
      nextLevel: "N4",
      nextItemId: "N4-001",
    })
  })

  it("recommends the next unfinished category", () => {
    const summaries = buildCategorySummaries(
      [
        makeItem("N5-001", "原因", 1201),
        makeItem("N5-002", "条件", 2401),
      ],
      { "N5-001": true },
    )

    const next = findNextCategoryToStudy(summaries)
    expect(next?.category).toBe("条件")
  })
})
