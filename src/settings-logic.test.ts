import { describe, expect, it } from "vitest"

import { applySourceDocPathChange } from "./settings-logic"


describe("applySourceDocPathChange", () => {
  it("keeps the new path when reindex succeeds", async () => {
    const result = await applySourceDocPathChange({
      previousPath: "JLPT/old.md",
      nextPath: "JLPT/new.md",
      reindex: async () => undefined,
    })

    expect(result.sourceDocPath).toBe("JLPT/new.md")
    expect(result.rolledBack).toBe(false)
  })

  it("rolls back to old path when reindex fails", async () => {
    const result = await applySourceDocPathChange({
      previousPath: "JLPT/old.md",
      nextPath: "JLPT/new.md",
      reindex: async () => {
        throw new Error("bad parse")
      },
    })

    expect(result.sourceDocPath).toBe("JLPT/old.md")
    expect(result.rolledBack).toBe(true)
    expect(result.reason).toContain("bad parse")
  })
})
