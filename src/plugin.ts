import { Notice, Plugin, TFile } from "obsidian"

import bundledMarkdown from "../assets/jlpt文法n5_to_n1.md"
import {
  COMMAND_CONTINUE_STUDY,
  COMMAND_INIT_LIBRARY,
  COMMAND_OPEN_STUDY,
  DEFAULT_DOC_PATH,
  VIEW_TYPE_STUDY,
} from "./constants"
import { initializeLibraryContent } from "./commands/init-library"
import { parseJLPTMarkdown, type GrammarIndexItem } from "./parser/jlpt-markdown-parser"
import { DEFAULT_SETTINGS } from "./settings"
import { JLPTSettingTab } from "./settings-tab"
import { createProgressStore } from "./state/progress-store"
import { StudyPanelView } from "./views/study-panel-view"
import { jumpToGrammarItem } from "./utils/jump-to-heading"
import type { PluginSettings } from "./types"
import { pickContinueStudyId } from "./commands/continue-study"


function getParentDir(path: string): string {
  const index = path.lastIndexOf("/")
  if (index <= 0) {
    return ""
  }
  return path.slice(0, index)
}


export class JLPTGrammarPlugin extends Plugin {
  settings: PluginSettings = { ...DEFAULT_SETTINGS, selectedLevels: [...DEFAULT_SETTINGS.selectedLevels], progress: {} }
  grammarItems: GrammarIndexItem[] = []
  private progressStore = createProgressStore({
    loadData: async () => this.loadData(),
    saveData: async (value) => {
      await this.saveData(value)
      this.settings = value
    },
  })

  async onload(): Promise<void> {
    await this.loadSettings()
    await this.reloadIndexSafely()

    this.registerView(VIEW_TYPE_STUDY, (leaf) => new StudyPanelView(leaf, this))
    this.addSettingTab(new JLPTSettingTab(this))

    this.addCommand({
      id: COMMAND_INIT_LIBRARY,
      name: "初始化文法库",
      callback: async () => {
        const result = await initializeLibraryContent({
          content: bundledMarkdown,
          targetPath: this.settings.sourceDocPath,
          exists: async (targetPath) => Boolean(this.app.vault.getAbstractFileByPath(targetPath)),
          ensureDir: async (targetPath) => {
            const dir = getParentDir(targetPath)
            if (dir && dir !== ".") {
              await this.app.vault.createFolder(dir).catch(() => undefined)
            }
          },
          write: async (targetPath, content) => {
            await this.app.vault.create(targetPath, content)
          },
        })
        new Notice(result.created ? `已创建 ${result.targetPath}` : `文法库已存在: ${result.targetPath}`)
        await this.reloadIndexSafely()
      },
    })

    this.addCommand({
      id: COMMAND_OPEN_STUDY,
      name: "打开学习面板",
      callback: async () => {
        await this.activateStudyView()
      },
    })

    this.addCommand({
      id: COMMAND_CONTINUE_STUDY,
      name: "继续学习",
      callback: async () => {
        const candidateIds = this.grammarItems
          .filter((item) => this.settings.selectedLevels.includes(item.level))
          .map((item) => item.id)
        const nextId = pickContinueStudyId({
          candidateIds,
          lastOpenedId: this.settings.lastOpenedId,
          doneMap: this.getDoneMap(),
        })
        if (!nextId) {
          new Notice("没有可继续的文法条目")
          return
        }
        const item = this.findItemById(nextId)
        if (!item) {
          new Notice(`找不到条目: ${nextId}`)
          return
        }
        await this.openGrammarItem(item)
      },
    })
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_STUDY)
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData()
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(loaded ?? {}),
      selectedLevels: Array.isArray(loaded?.selectedLevels) && loaded.selectedLevels.length > 0 ? loaded.selectedLevels : [...DEFAULT_SETTINGS.selectedLevels],
      progress: typeof loaded?.progress === "object" && loaded?.progress !== null ? loaded.progress : {},
      dailyTodos: Array.isArray(loaded?.dailyTodos) ? loaded.dailyTodos.filter((t: unknown) => typeof t === "string").slice(0, 3) : [],
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  getVisibleItemsForMode(mode: StudyViewMode, levels: Set<JLPTLevel>, showUnlearnedOnly: boolean): GrammarIndexItem[] {
    return this.grammarItems.filter((item) => {
      if (!levels.has(item.level)) {
        return false
      }
      if (showUnlearnedOnly && this.getDoneMap()[item.id]) {
        return false
      }
      return true
    })
  }

  async reloadIndexFromSourceOrThrow(sourceDocPath: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(sourceDocPath)
    if (!(file instanceof TFile)) {
      throw new Error(`source_not_found path=${sourceDocPath}`)
    }
    const content = await this.app.vault.cachedRead(file)
    this.grammarItems = parseJLPTMarkdown(content)
  }

  async reloadIndexSafely(): Promise<void> {
    try {
      await this.reloadIndexFromSourceOrThrow(this.settings.sourceDocPath)
    } catch {
      this.grammarItems = parseJLPTMarkdown(bundledMarkdown)
    }
    this.refreshStudyView()
  }

  getDoneMap(): Record<string, boolean> {
    const doneMap: Record<string, boolean> = {}
    for (const [id, item] of Object.entries(this.settings.progress)) {
      doneMap[id] = item.done
    }
    return doneMap
  }

  async setDone(id: string, done: boolean): Promise<void> {
    await this.progressStore.setDone(id, done)
    this.settings = await this.progressStore.getState()
    this.refreshStudyView()
  }

  findItemById(id: string): GrammarIndexItem | undefined {
    return this.grammarItems.find((item) => item.id === id)
  }

  async openGrammarItem(item: GrammarIndexItem): Promise<void> {
    await this.progressStore.markViewed(item.id)
    this.settings = await this.progressStore.getState()
    await jumpToGrammarItem(this.app, this.settings.sourceDocPath, item)
    this.refreshStudyView()
  }

  async activateStudyView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_STUDY)[0]
    const leaf = existing ?? this.app.workspace.getRightLeaf(false)
    if (!leaf) {
      new Notice("无法创建学习面板")
      return
    }
    await leaf.setViewState({ type: VIEW_TYPE_STUDY, active: true })
    this.app.workspace.revealLeaf(leaf)
  }

  refreshStudyView(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_STUDY)
    leaves.forEach((leaf) => {
      const view = leaf.view
      if (view instanceof StudyPanelView) {
        view.refresh()
      }
    })
  }
}
