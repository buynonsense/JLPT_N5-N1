export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1"

export type TeachingCategory = (typeof import("./original-theme-meta").ORIGINAL_THEME_CATEGORY_ORDER)[number]

export type StudyViewMode = "category" | "level"

export interface ProgressItem {
  done: boolean
  doneAt?: string
  lastViewedAt?: string
  reviewCount: number
}

export interface DailyTodoItem {
  text: string
  completed: boolean
}

export interface PluginSettings {
  version: number
  sourceDocPath: string
  selectedLevels: JLPTLevel[]
  defaultShowUnlearnedOnly: boolean
  preferredViewMode?: StudyViewMode
  lastOpenedId?: string
  progress: Record<string, ProgressItem>
  dailyTodos: DailyTodoItem[]
}
