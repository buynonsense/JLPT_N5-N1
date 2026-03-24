import type { JLPTLevel, StudyViewMode, TeachingCategory } from "../types"
import { buildCategoryOrder, classifyTeachingCategory } from "../teaching-categories"


export interface GrammarIndexItem {
  id: string
  level: JLPTLevel
  order: number
  globalIndex: number
  title: string
  stars: string
  tag: string | null
  teachingCategory: TeachingCategory
  categoryOrder: number
  headingText: string
  sectionHeading: string
  lineStart: number
}


const SECTION_PATTERN = /^# JLPT (N[1-5]) 文法整理$/
const ROOT_TITLE_PATTERN = /^# JLPT N5-N1 文法总整理$/
const ITEM_PATTERN = /^## (\d{3})\.\s+(.+?)\s+(★+☆?)$/
const TAG_PATTERN = /^- 分类：(.*)$/


export function parseJLPTMarkdown(markdown: string): GrammarIndexItem[] {
  const lines = markdown.split(/\r?\n/)
  const items: GrammarIndexItem[] = []
  const seenIds = new Map<string, number>()
  let currentLevel: JLPTLevel | null = null
  let currentSectionHeading = ""
  let pendingTag: string | null = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) {
      continue
    }

    if (line.startsWith("# ")) {
      if (ROOT_TITLE_PATTERN.test(line)) {
        continue
      }
      const match = line.match(SECTION_PATTERN)
      if (!match) {
        throw new Error(`invalid section heading: line=${index + 1} text=${line}`)
      }
      currentLevel = match[1] as JLPTLevel
      currentSectionHeading = line.slice(2)
      continue
    }

    if (line.startsWith("## ")) {
      if (!currentLevel) {
        throw new Error(`item before section: line=${index + 1} text=${line}`)
      }
      const match = line.match(ITEM_PATTERN)
      if (!match) {
        throw new Error(`invalid item heading: line=${index + 1} text=${line}`)
      }
      const order = Number(match[1])
      const title = match[2]
      const stars = match[3]
      const id = `${currentLevel}-${match[1]}`
      if (seenIds.has(id)) {
        throw new Error(
          `duplicate id: id=${id} firstLine=${seenIds.get(id)} secondLine=${index + 1}`,
        )
      }
      seenIds.set(id, index + 1)
      items.push({
        id,
        level: currentLevel,
        order,
        globalIndex: items.length + 1,
        title,
        stars,
        tag: null,
        teachingCategory: classifyTeachingCategory(title, null),
        categoryOrder: buildCategoryOrder(currentLevel, order),
        headingText: line.slice(3),
        sectionHeading: currentSectionHeading,
        lineStart: index + 1,
      })
      pendingTag = id
      continue
    }

    if (line.startsWith("- 分类：") && pendingTag) {
      const match = line.match(TAG_PATTERN)
      if (match) {
        const item = items[items.length - 1]
        item.tag = match[1].trim() || null
        item.teachingCategory = classifyTeachingCategory(item.title, item.tag)
      }
      pendingTag = null
    }
  }

  return items
}
