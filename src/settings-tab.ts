import { Notice, PluginSettingTab, Setting } from "obsidian"

import type { JLPTGrammarPlugin } from "./plugin"
import { applySourceDocPathChange } from "./settings-logic"
import type { JLPTLevel } from "./types"


const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"]


export class JLPTSettingTab extends PluginSettingTab {
  plugin: JLPTGrammarPlugin

  constructor(plugin: JLPTGrammarPlugin) {
    super(plugin.app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName("文法文档路径")
      .setDesc("首次初始化后默认复制到这个路径")
      .addText((text) => {
        text.setPlaceholder("JLPT/jlpt文法n5_to_n1.md")
        text.setValue(this.plugin.settings.sourceDocPath)
        text.onChange(async (value) => {
          const nextPath = value.trim()
          if (!nextPath || nextPath === this.plugin.settings.sourceDocPath) {
            return
          }
          const previousPath = this.plugin.settings.sourceDocPath
          this.plugin.settings.sourceDocPath = nextPath
          await this.plugin.saveSettings()
          const result = await applySourceDocPathChange({
            previousPath,
            nextPath,
            reindex: async () => {
              await this.plugin.reloadIndexFromSourceOrThrow(nextPath)
            },
          })
          this.plugin.settings.sourceDocPath = result.sourceDocPath
          await this.plugin.saveSettings()
          if (result.rolledBack) {
            new Notice(`重新索引失败，已回退到旧路径：${result.reason}`)
          } else {
            new Notice(`已切换文法文档：${nextPath}`)
          }
          await this.plugin.reloadIndexSafely()
          this.display()
        })
      })

    new Setting(containerEl)
      .setName("默认只显示未学")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.defaultShowUnlearnedOnly)
        toggle.onChange(async (value) => {
          this.plugin.settings.defaultShowUnlearnedOnly = value
          await this.plugin.saveSettings()
          this.plugin.refreshStudyView()
        })
      })

    const levelSetting = new Setting(containerEl)
    levelSetting.setName("默认学习等级")
    levelSetting.setDesc("至少保留一个等级")
    LEVELS.forEach((level) => {
      levelSetting.addToggle((toggle) => {
        toggle.setTooltip(level)
        toggle.setValue(this.plugin.settings.selectedLevels.includes(level))
        toggle.onChange(async (value) => {
          const next = new Set(this.plugin.settings.selectedLevels)
          if (value) {
            next.add(level)
          } else {
            next.delete(level)
          }
          if (next.size === 0) {
            next.add("N5")
          }
          this.plugin.settings.selectedLevels = Array.from(next) as JLPTLevel[]
          await this.plugin.saveSettings()
          this.plugin.refreshStudyView()
        })
      })
    })
  }
}
