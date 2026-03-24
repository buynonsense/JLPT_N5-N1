import { describe, expect, it } from "vitest"

import { groupItemsByCategory, normalizeViewMode } from "./study-view-logic"
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


describe("study view logic", () => {
  it("groups items by teaching category in configured order", () => {
    const groups = groupItemsByCategory([
      makeItem("N4-001", "条件假设", 2001),
      makeItem("N5-001", "原因理由", 1001),
      makeItem("N5-002", "条件假设", 1002),
    ])

    expect(groups.map((group) => group.category)).toEqual(["原因理由", "条件假设"])
    expect(groups[1].items.map((item) => item.id)).toEqual(["N5-002", "N4-001"])
  })

  it("defaults view mode to category", () => {
    expect(normalizeViewMode(undefined)).toBe("category")
    expect(normalizeViewMode("level")).toBe("level")
  })
})
