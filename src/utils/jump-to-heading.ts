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

export interface BuildSmoothScrollFramesInput {
  startTop: number
  endTop: number
  steps: number
}

export interface CalculateTargetScrollTopInput {
  lineTop: number
  viewportHeight: number
  offsetTop: number
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


export function buildSmoothScrollFrames(input: BuildSmoothScrollFramesInput): number[] {
  if (input.startTop === input.endTop) {
    return [Math.round(input.endTop)]
  }

  const frames: number[] = []
  for (let step = 1; step <= input.steps; step += 1) {
    const progress = step / input.steps
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    frames.push(Math.round(input.startTop + (input.endTop - input.startTop) * eased))
  }
  return frames
}


export function calculateTargetScrollTop(input: CalculateTargetScrollTopInput): number {
  return Math.max(0, Math.round(input.lineTop - input.viewportHeight / 2 + input.offsetTop))
}


function getEditorScrollElement(view: WorkspaceLeaf["view"]): HTMLElement | null {
  const container = (view as { containerEl?: HTMLElement }).containerEl
  if (!container) {
    return null
  }
  return container.querySelector(".cm-scroller") as HTMLElement | null
}


function getEditorLineTop(view: WorkspaceLeaf["view"], line: number): number | null {
  const editorView = (view as { editor?: { cm?: { coordsAtPos?: (pos: number) => { top: number } | null; state?: { doc?: { line: (line: number) => { from: number } } } } } }).editor?.cm
  if (!editorView?.coordsAtPos || !editorView.state?.doc?.line) {
    return null
  }

  const lineInfo = editorView.state.doc.line(line + 1)
  const coords = editorView.coordsAtPos(lineInfo.from)
  return coords?.top ?? null
}


async function smoothScrollToPosition(input: {
  scrollElement: HTMLElement
  targetTop: number
  maxDistance: number
}): Promise<boolean> {
  const startTop = input.scrollElement.scrollTop
  const distance = Math.abs(input.targetTop - startTop)
  if (distance === 0) {
    return true
  }
  if (distance > input.maxDistance) {
    return false
  }

  const frames = buildSmoothScrollFrames({
    startTop,
    endTop: input.targetTop,
    steps: 14,
  })

  await new Promise<void>((resolve) => {
    let index = 0
    const step = (): void => {
      input.scrollElement.scrollTop = frames[index]
      index += 1
      if (index >= frames.length) {
        resolve()
        return
      }
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

  return true
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
    const scrollElement = getEditorScrollElement(leaf.view)
    const lineTop = getEditorLineTop(leaf.view, position.line - 1)
    const targetTop = lineTop === null
      ? null
      : calculateTargetScrollTop({
        lineTop,
        viewportHeight: scrollElement?.clientHeight ?? 0,
        offsetTop: 24,
      })
    const didSmoothScroll = scrollElement
      && targetTop !== null
      ? await smoothScrollToPosition({
        scrollElement,
        targetTop,
        maxDistance: 2800,
      })
      : false

    if (!didSmoothScroll) {
      view.editor.scrollIntoView(
        {
          from: { line: position.line - 1, ch: position.column },
          to: { line: position.line - 1, ch: position.column },
        },
        true,
      )
    } else {
      view.editor.scrollIntoView(
        {
          from: { line: position.line - 1, ch: position.column },
          to: { line: position.line - 1, ch: position.column },
        },
        true,
      )
    }
  }
}
