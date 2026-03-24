import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"


describe("plugin bootstrap", () => {
  it("contains plugin entry files", () => {
    expect(existsSync(resolve(__dirname, "plugin.ts"))).toBe(true)
    expect(existsSync(resolve(__dirname, "..", "main.ts"))).toBe(true)
  })

  it("provides required manifest fields", () => {
    const manifestPath = resolve(__dirname, "..", "manifest.json")
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<string, unknown>
    expect(manifest.id).toBe("jlpt-n5-n1")
    expect(manifest.name).toBeTruthy()
    expect(manifest.version).toBeTruthy()
  })
})
