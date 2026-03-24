import { describe, expect, it } from "vitest"

import { DEFAULT_SETTINGS } from "./settings"


describe("default settings", () => {
  it("uses the default JLPT document path", () => {
    expect(DEFAULT_SETTINGS.sourceDocPath).toBe("JLPT/jlpt文法n5_to_n1.md")
  })

  it("defaults to N5 and shows all items", () => {
    expect(DEFAULT_SETTINGS.selectedLevels).toEqual(["N5"])
    expect(DEFAULT_SETTINGS.defaultShowUnlearnedOnly).toBe(false)
    expect(DEFAULT_SETTINGS.preferredViewMode).toBe("category")
  })
})
