import { describe, expect, it } from "vitest"

import { buildCategoryOrder, classifyTeachingCategory } from "./teaching-categories"


describe("teaching categories", () => {
  it("classifies conditional grammar into 条件假设", () => {
    expect(classifyTeachingCategory("〜たら", "N4條件")).toBe("条件假设")
  })

  it("classifies hearsay grammar into 推测传闻样态", () => {
    expect(classifyTeachingCategory("〜そうだ（伝聞）", "N4傳聞")).toBe("推测传闻样态")
  })

  it("classifies request grammar into 意志愿望请求建议", () => {
    expect(classifyTeachingCategory("〜て ください", null)).toBe("意志愿望请求建议")
  })

  it("orders items by level and original order", () => {
    expect(buildCategoryOrder("N5", 10)).toBeLessThan(buildCategoryOrder("N4", 1))
  })

  it("keeps judgement and negation grammar out of quantity category", () => {
    expect(classifyTeachingCategory("〜は〜では ありません", null)).toBe("判断否定")
  })

  it("classifies result-state grammar into 动作状态结果存续", () => {
    expect(classifyTeachingCategory("〜て いる", null)).toBe("动作状态结果存续")
  })

  it("classifies parallel grammar into 并列列举选择", () => {
    expect(classifyTeachingCategory("〜と（並立）", "N5並列")).toBe("并列列举选择")
  })

  it("uses manual overrides for ambiguous edge cases", () => {
    expect(classifyTeachingCategory("〜のに", "N4逆接")).toBe("转折让步")
  })
})
