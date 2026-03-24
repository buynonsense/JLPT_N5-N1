import type { App } from "obsidian"

import type { GrammarIndexItem } from "../parser/jlpt-markdown-parser"


export interface HeadingPosition {
  line: number
  column: number
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


export async function jumpToGrammarItem(
  app: App,
  sourceDocPath: string,
  item: GrammarIndexItem,
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(sourceDocPath)
  if (!file || !("path" in file)) {
    throw new Error(`跳转失败: item=${item.id} sourceDocPath=${sourceDocPath} reason=file_not_found`)
  }

  const leaf = app.workspace.getLeaf(true)
  await leaf.openFile(file)

  const view = leaf.view as {
    editor?: {
      setCursor: (line: number, ch: number) => void
      scrollIntoView: (range: { from: { line: number; ch: number }; to: { line: number; ch: number } }, center?: boolean) => void
    }
  }
  const content = await app.vault.cachedRead(file)
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
