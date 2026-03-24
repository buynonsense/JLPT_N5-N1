import type { GrammarIndexItem } from "../parser/jlpt-markdown-parser"
import type { JLPTLevel, StudyViewMode, TeachingCategory } from "../types"
import { CATEGORY_ORDER } from "../teaching-categories"


export interface CategoryGroup {
  category: TeachingCategory
  items: GrammarIndexItem[]
}

export interface CategorySummary {
  category: TeachingCategory
  total: number
  done: number
  nextLevel: GrammarIndexItem["level"] | null
  nextItemId: string | null
}


export function sortItemsForCategory(items: GrammarIndexItem[]): GrammarIndexItem[] {
  return [...items].sort((a, b) => a.categoryOrder - b.categoryOrder || a.globalIndex - b.globalIndex)
}


export function groupItemsByCategory(items: GrammarIndexItem[]): CategoryGroup[] {
  const groups = new Map<TeachingCategory, GrammarIndexItem[]>()
  for (const item of sortItemsForCategory(items)) {
    const bucket = groups.get(item.teachingCategory) ?? []
    bucket.push(item)
    groups.set(item.teachingCategory, bucket)
  }
  return CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => ({
    category,
    items: groups.get(category) ?? [],
  }))
}


export function buildCategorySummaries(
  items: GrammarIndexItem[],
  doneMap: Record<string, boolean>,
): CategorySummary[] {
  return groupItemsByCategory(items).map((group) => {
    const done = group.items.filter((item) => doneMap[item.id]).length
    const next = group.items.find((item) => !doneMap[item.id]) ?? null
    return {
      category: group.category,
      total: group.items.length,
      done,
      nextLevel: next?.level ?? null,
      nextItemId: next?.id ?? null,
    }
  })
}


export function findNextCategoryToStudy(
  summaries: CategorySummary[],
): CategorySummary | null {
  return summaries.find((summary) => summary.done < summary.total) ?? null
}


export function filterItemsByLevels(items: GrammarIndexItem[], levels: Set<JLPTLevel>): GrammarIndexItem[] {
  return items.filter((item) => levels.has(item.level))
}


export function normalizeViewMode(mode: StudyViewMode | undefined): StudyViewMode {
  return mode === "level" ? "level" : "category"
}
