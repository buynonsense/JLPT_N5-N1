import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"


const pluginPath = resolve(__dirname, "plugin.ts")


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

  it("registers a single JLPT ribbon icon with toggle behavior", () => {
    const pluginSource = readFileSync(pluginPath, "utf-8")

    expect(pluginSource).toContain("this.addRibbonIcon")
    expect(pluginSource).toContain("JLPT文法")
    expect(pluginSource).toContain("toggleJLPTWorkspace")
  })

  it("opens the study view before jumping to grammar when toggling the JLPT workspace", () => {
    const pluginSource = readFileSync(pluginPath, "utf-8")
    const toggleStart = pluginSource.indexOf("async toggleJLPTWorkspace(): Promise<void> {")
    const toggleEnd = pluginSource.indexOf("async openGrammarItem(item: GrammarIndexItem): Promise<void> {")
    const toggleSource = pluginSource.slice(toggleStart, toggleEnd)

    expect(toggleSource.indexOf("await this.activateStudyView()")).toBeLessThan(
      toggleSource.indexOf("await this.continueStudyWithPreferredLeaf(preferredLeaf)"),
    )
  })

})
