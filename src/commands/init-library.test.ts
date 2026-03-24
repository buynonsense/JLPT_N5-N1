import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { initializeLibraryFile } from "./init-library"


const tempPaths: string[] = []


function makeTempDir(name: string): string {
  const dir = join(tmpdir(), `jlpt-init-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  mkdirSync(dir, { recursive: true })
  tempPaths.push(dir)
  return dir
}


afterEach(() => {
  for (const path of tempPaths.splice(0)) {
    rmSync(path, { recursive: true, force: true })
  }
})


describe("initializeLibraryFile", () => {
  it("copies the bundled document when target does not exist", async () => {
    const root = makeTempDir("copy")
    const assetPath = join(root, "bundled.md")
    const targetPath = join(root, "nested", "jlpt文法n5_to_n1.md")
    writeFileSync(assetPath, "# bundled", "utf-8")

    const result = await initializeLibraryFile({ assetPath, targetPath })

    expect(result.created).toBe(true)
    expect(readFileSync(targetPath, "utf-8")).toBe("# bundled")
  })

  it("does not overwrite an existing target file", async () => {
    const root = makeTempDir("existing")
    const assetPath = join(root, "bundled.md")
    const targetPath = join(root, "jlpt文法n5_to_n1.md")
    writeFileSync(assetPath, "# bundled", "utf-8")
    writeFileSync(targetPath, "# existing", "utf-8")

    const result = await initializeLibraryFile({ assetPath, targetPath })

    expect(result.created).toBe(false)
    expect(readFileSync(targetPath, "utf-8")).toBe("# existing")
  })

  it("includes the target path when copy fails", async () => {
    const root = makeTempDir("failure")
    const targetPath = join(root, "nested", "jlpt文法n5_to_n1.md")

    await expect(
      initializeLibraryFile({
        assetPath: join(root, "missing.md"),
        targetPath,
      }),
    ).rejects.toThrow(targetPath)
  })
})
