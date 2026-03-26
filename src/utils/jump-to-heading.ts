import type { App, TFile, WorkspaceLeaf } from "obsidian"

import type { GrammarIndexItem } from "../parser/jlpt-markdown-parser"


export interface HeadingPosition {
  line: number
  column: number
}

export interface PickTargetLeafInput {
  preferredLeaf?: {
    view?: {
      file?: {
        path?: string
      }
    }
  } | null
  activeLeaf: {
    view?: {
      file?: {
        path?: string
      }
    }
  } | null
  markdownLeaves: Array<{
    view?: {
      file?: {
        path?: string
      }
    }
  }>
  sourceDocPath: string
}


export function findHeadingPosition(markdown: string, headingText: string): HeadingPosition | null {
  const lines = markdown.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index] === `## ${headingText}`) {
      return { line: index + 1, column: 0 }
    }
  }
  return null
}


export function pickTargetLeaf(input: PickTargetLeafInput): PickTargetLeafInput["activeLeaf"] {
  if (input.preferredLeaf?.view?.file?.path === input.sourceDocPath) {
    return input.preferredLeaf
  }

  if (input.activeLeaf?.view?.file?.path === input.sourceDocPath) {
    return input.activeLeaf
  }

  return input.markdownLeaves.find((leaf) => leaf.view?.file?.path === input.sourceDocPath) ?? null
}


export async function jumpToGrammarItem(
  app: App,
  sourceDocPath: string,
  item: GrammarIndexItem,
  preferredLeaf?: WorkspaceLeaf | null,
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(sourceDocPath)
  if (!file || !("path" in file)) {
    throw new Error(`跳转失败: item=${item.id} sourceDocPath=${sourceDocPath} reason=file_not_found`)
  }
  const targetFile = file as TFile

  const leaf = (pickTargetLeaf({
    preferredLeaf: preferredLeaf as PickTargetLeafInput["preferredLeaf"],
    activeLeaf: app.workspace.activeLeaf as PickTargetLeafInput["activeLeaf"],
    markdownLeaves: app.workspace.getLeavesOfType("markdown") as PickTargetLeafInput["markdownLeaves"],
    sourceDocPath,
  }) as WorkspaceLeaf | null) ?? app.workspace.getLeaf(true)
  await leaf.openFile(targetFile)

  const view = leaf.view as {
    editor?: {
      setCursor: (line: number, ch: number) => void
      scrollIntoView: (range: { from: { line: number; ch: number }; to: { line: number; ch: number } }, center?: boolean) => void
    }
  }
  const content = await app.vault.cachedRead(targetFile)
  const position = findHeadingPosition(content, item.headingText)
  if (!position) {
    throw new Error(`跳转失败: item=${item.id} sourceDocPath=${sourceDocPath} reason=heading_not_found`)
  }
  if (view.editor) {
    view.editor.setCursor(position.line - 1, position.column)
    view.editor.scrollIntoView(
      {
        from: { line: position.line - 1, ch: position.column },
        to: { line: position.line - 1, ch: position.column },
      },
      true,
    )
  }
}
