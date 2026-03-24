import { copyFile, mkdir, stat } from "node:fs/promises"
import { dirname } from "node:path"


export interface InitializeLibraryInput {
  assetPath: string
  targetPath: string
}


export interface InitializeLibraryResult {
  created: boolean
  targetPath: string
}


export interface InitializeLibraryContentInput {
  content: string
  targetPath: string
  exists: (targetPath: string) => Promise<boolean>
  ensureDir: (targetPath: string) => Promise<void>
  write: (targetPath: string, content: string) => Promise<void>
}


export async function initializeLibraryFile(
  input: InitializeLibraryInput,
): Promise<InitializeLibraryResult> {
  try {
    await stat(input.targetPath)
    return {
      created: false,
      targetPath: input.targetPath,
    }
  } catch {
    await mkdir(dirname(input.targetPath), { recursive: true })
  }

  try {
    await copyFile(input.assetPath, input.targetPath)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`初始化文法库失败: target=${input.targetPath} reason=${message}`)
  }

  return {
    created: true,
    targetPath: input.targetPath,
  }
}


export async function initializeLibraryContent(
  input: InitializeLibraryContentInput,
): Promise<InitializeLibraryResult> {
  if (await input.exists(input.targetPath)) {
    return {
      created: false,
      targetPath: input.targetPath,
    }
  }

  try {
    await input.ensureDir(input.targetPath)
    await input.write(input.targetPath, input.content)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`初始化文法库失败: target=${input.targetPath} reason=${message}`)
  }

  return {
    created: true,
    targetPath: input.targetPath,
  }
}
