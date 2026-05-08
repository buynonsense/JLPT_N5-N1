import { describe, expect, it } from "vitest"

import { buildCategoryOrder, classifyTeachingCategory, CATEGORY_ORDER } from "./teaching-categories"


describe("teaching categories", () => {
  it("uses the original site category order", () => {
    expect(CATEGORY_ORDER[0]).toBe("比较")
    expect(CATEGORY_ORDER).toContain("开始")
    expect(CATEGORY_ORDER).toContain("忍不住")
  })

  it("maps sample grammar titles to original categories", () => {
    expect(classifyTeachingCategory("〜より", null)).toBe("比较")
    expect(classifyTeachingCategory("〜は〜です", null)).toBe("断言")
    expect(classifyTeachingCategory("〜を 皮切りに", null)).toBe("开始")
    expect(classifyTeachingCategory("〜て たまらない", null)).toBe("忍不住")
    expect(classifyTeachingCategory("〜に ついて", "話題")).toBe("话题")
    expect(classifyTeachingCategory("〜に ついて", "關聯")).toBe("关联")
  })

  it("orders items by level and original order", () => {
    expect(buildCategoryOrder("N5", 10)).toBeLessThan(buildCategoryOrder("N4", 1))
  })
})
