import { ItemView, Notice, Setting, WorkspaceLeaf } from "obsidian"

import { VIEW_TYPE_STUDY } from "../constants"
import { pickCandidateIds, pickContinueStudyId } from "../commands/continue-study"
import { jumpToGrammarItem } from "../utils/jump-to-heading"
import type { GrammarIndexItem } from "../parser/jlpt-markdown-parser"
import type { JLPTGrammarPlugin } from "../plugin"
import type { JLPTLevel, StudyViewMode } from "../types"
import { buildCategorySummaries, groupItemsByCategory, normalizeViewMode } from "./study-view-logic"


const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"]


export class StudyPanelView extends ItemView {
  plugin: JLPTGrammarPlugin
  temporaryLevels: Set<JLPTLevel>
  showUnlearnedOnly: boolean
  viewMode: StudyViewMode

  constructor(leaf: WorkspaceLeaf, plugin: JLPTGrammarPlugin) {
    super(leaf)
    this.plugin = plugin
    this.temporaryLevels = new Set(plugin.settings.selectedLevels)
    this.showUnlearnedOnly = plugin.settings.defaultShowUnlearnedOnly
    this.viewMode = normalizeViewMode(plugin.settings.preferredViewMode)
  }

  getViewType(): string {
    return VIEW_TYPE_STUDY
  }

  getDisplayText(): string {
    return "JLPT 学习"
  }

  async onOpen(): Promise<void> {
    this.render()
  }

  refresh(): void {
    if (this.temporaryLevels.size === 0) {
      this.temporaryLevels = new Set(this.plugin.settings.selectedLevels)
    }
    this.viewMode = normalizeViewMode(this.plugin.settings.preferredViewMode)
    this.render()
  }

  private getFilteredItems(): GrammarIndexItem[] {
    return this.plugin.grammarItems.filter((item) => {
      if (!this.temporaryLevels.has(item.level)) {
        return false
      }
      if (this.showUnlearnedOnly) {
        return !this.plugin.getDoneMap()[item.id]
      }
      return true
    })
  }

  private render(): void {
    const container = this.containerEl.children[1]
    container.empty()
    container.addClass("jlpt-grammar-plugin")

    const filtered = this.getFilteredItems()
    const doneMap = this.plugin.getDoneMap()
    const doneCount = filtered.filter((item) => doneMap[item.id]).length

    const header = container.createDiv({ cls: "jlpt-header" })
    header.createEl("h3", { text: "JLPT 学习面板" })
    header.createDiv({ text: `已学 ${doneCount} / ${filtered.length}` })

    if (this.plugin.grammarItems.length === 0) {
      container.createDiv({ text: "当前没有可解析的文法数据，请先初始化文法库。" })
      return
    }

    const modeContainer = container.createDiv({ cls: "jlpt-levels" })
    ;(["category", "level"] as StudyViewMode[]).forEach((mode) => {
      const button = modeContainer.createEl("button", {
        text: mode === "category" ? "分类学习" : "等级浏览",
      })
      if (this.viewMode === mode) {
        button.addClass("is-active")
      }
      button.addEventListener("click", async () => {
        this.viewMode = mode
        this.plugin.settings.preferredViewMode = mode
        await this.plugin.saveSettings()
        this.render()
      })
    })

    const levelContainer = container.createDiv({ cls: "jlpt-levels" })
    LEVELS.forEach((level) => {
      const button = levelContainer.createEl("button", { text: level })
      if (this.temporaryLevels.has(level)) {
        button.addClass("is-active")
      }
      button.addEventListener("click", () => {
        if (this.temporaryLevels.has(level) && this.temporaryLevels.size > 1) {
          this.temporaryLevels.delete(level)
        } else {
          this.temporaryLevels.add(level)
        }
        this.render()
      })
    })

    new Setting(container)
      .setName("只看未学")
      .addToggle((toggle) => {
        toggle.setValue(this.showUnlearnedOnly)
        toggle.onChange((value) => {
          this.showUnlearnedOnly = value
          this.render()
        })
      })

    new Setting(container)
      .setName("操作")
      .addButton((button) => {
        button.setButtonText("继续学习")
        button.onClick(async () => {
          const nextId = pickContinueStudyId({
            candidateIds: pickCandidateIds(filtered),
            lastOpenedId: this.plugin.settings.lastOpenedId,
            doneMap,
          })
          if (!nextId) {
            new Notice("没有可继续的文法条目")
            return
          }
          const item = this.plugin.findItemById(nextId)
          if (!item) {
            new Notice(`找不到条目: ${nextId}`)
            return
          }
          await this.plugin.openGrammarItem(item)
        })
      })
      .addButton((button) => {
        button.setButtonText("清除筛选")
        button.onClick(() => {
          this.temporaryLevels = new Set(this.plugin.settings.selectedLevels)
          this.showUnlearnedOnly = this.plugin.settings.defaultShowUnlearnedOnly
          this.render()
        })
      })

    const list = container.createDiv({ cls: "jlpt-list" })
    if (filtered.length === 0) {
      list.createDiv({ text: "当前筛选下没有条目" })
      return
    }

    if (this.viewMode === "category") {
      const groups = groupItemsByCategory(filtered)
      const summaries = buildCategorySummaries(filtered, doneMap)
      const summaryWrap = list.createDiv({ cls: "jlpt-category-summary-grid" })
      summaries.forEach((summary) => {
        const card = summaryWrap.createDiv({ cls: "jlpt-category-card" })
        card.createEl("strong", { text: summary.category })
        card.createDiv({ text: `进度 ${summary.done}/${summary.total}` })
        card.createDiv({ text: `当前层级 ${summary.nextLevel ?? "已完成"}` })
        const actionRow = card.createDiv({ cls: "jlpt-card-actions" })
        const continueButton = actionRow.createEl("button", { text: "从本类继续" })
        continueButton.disabled = !summary.nextItemId
        continueButton.addEventListener("click", async () => {
          if (!summary.nextItemId) {
            return
          }
          const item = this.plugin.findItemById(summary.nextItemId)
          if (!item) {
            new Notice(`找不到条目: ${summary.nextItemId}`)
            return
          }
          await this.plugin.openGrammarItem(item)
        })

        const filterButton = actionRow.createEl("button", { text: "只看本类未学" })
        filterButton.disabled = !summary.nextItemId
        filterButton.addEventListener("click", () => {
          this.showUnlearnedOnly = true
          const targetGroup = groups.find((group) => group.category === summary.category)
          if (!targetGroup) {
            return
          }
          list.empty()
          const section = list.createDiv({ cls: "jlpt-group" })
          section.createEl("h4", { text: `${summary.category}（未学）` })
          targetGroup.items
            .filter((item) => !doneMap[item.id])
            .forEach((item) => {
              this.renderRow(section, item, doneMap)
            })
        })
      })
      groups.forEach((group) => {
        const groupDone = group.items.filter((item) => doneMap[item.id]).length
        const nextItem = group.items.find((item) => !doneMap[item.id])
        const section = list.createDiv({ cls: "jlpt-group" })
        section.createEl("h4", { text: `${group.category}（${groupDone}/${group.items.length}）` })
        section.createDiv({
          cls: "jlpt-group-meta",
          text: `推荐下一步：${nextItem ? `${nextItem.level} ${nextItem.title}` : "该分类已完成"}`,
        })
        group.items.forEach((item) => {
          this.renderRow(section, item, doneMap)
        })
      })
      return
    }

    filtered.forEach((item) => {
      this.renderRow(list, item, doneMap)
    })
  }

  private renderRow(container: HTMLElement, item: GrammarIndexItem, doneMap: Record<string, boolean>): void {
    const row = container.createDiv({ cls: "jlpt-row" })
    const checkbox = row.createEl("input", { type: "checkbox" })
    checkbox.checked = !!doneMap[item.id]
    checkbox.addEventListener("change", async () => {
      await this.plugin.setDone(item.id, checkbox.checked)
      this.render()
    })

    row.createEl("span", { text: item.level, cls: "jlpt-level-tag" })
    const link = row.createEl("button", {
      text: `${item.id} ${item.title} ${item.stars}`,
      cls: "jlpt-row-link",
    })
    link.addEventListener("click", async () => {
      try {
        await this.plugin.openGrammarItem(item)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        new Notice(message)
      }
    })
  }
}
