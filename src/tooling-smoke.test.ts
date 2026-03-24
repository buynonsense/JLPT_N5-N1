import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"


const root = resolve(__dirname, "..")


describe("tooling setup", () => {
  it("declares build, test, and dev scripts", () => {
    const packageJsonPath = resolve(root, "package.json")
    expect(existsSync(packageJsonPath)).toBe(true)

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
      scripts?: Record<string, string>
    }

    expect(packageJson.scripts?.build).toBeTruthy()
    expect(packageJson.scripts?.test).toBeTruthy()
    expect(packageJson.scripts?.dev).toBeTruthy()
  })

  it("contains esbuild and vitest config files", () => {
    expect(existsSync(resolve(root, "esbuild.config.mjs"))).toBe(true)
    expect(existsSync(resolve(root, "vitest.config.ts"))).toBe(true)
  })
})
