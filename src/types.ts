export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1"

export type TeachingCategory =
  | "判断否定"
  | "疑问指示"
  | "并列列举选择"
  | "原因理由"
  | "条件假设"
  | "转折让步"
  | "时间顺序时点"
  | "比较程度"
  | "意志愿望请求建议"
  | "推测传闻样态"
  | "授受受益"
  | "限定范围数量"
  | "形式名词名词化"
  | "句尾表达语气"
  | "动作状态结果存续"
  | "敬语书面表达"
  | "高阶书面逻辑"

export type StudyViewMode = "category" | "level"

export interface ProgressItem {
  done: boolean
  doneAt?: string
  lastViewedAt?: string
  reviewCount: number
}

export interface PluginSettings {
  version: number
  sourceDocPath: string
  selectedLevels: JLPTLevel[]
  defaultShowUnlearnedOnly: boolean
  preferredViewMode?: StudyViewMode
  lastOpenedId?: string
  progress: Record<string, ProgressItem>
  dailyTodos: string[]
}
