import themeData from "../scripts/original-theme-categories.json"

import { ORIGINAL_THEME_CATEGORY_ORDER, type OriginalThemeCategoryName } from "./original-theme-meta"
import type { JLPTLevel, TeachingCategory } from "./types"


export interface OriginalThemeItem {
  level: JLPTLevel
  id: string
  title: string
  stars: string
}

export interface OriginalThemeCategory {
  id: string
  headingCn: OriginalThemeCategoryName
  headingRaw: string
  title: string
  items: OriginalThemeItem[]
}


const typedThemeData = themeData as OriginalThemeCategory[]


export const CATEGORY_ORDER: TeachingCategory[] = [...ORIGINAL_THEME_CATEGORY_ORDER]


function normalizeOriginalCategoryName(categoryName: string): TeachingCategory {
  return categoryName === "制御不能" ? "忍不住" : (categoryName as TeachingCategory)
}

const TITLE_TO_CATEGORIES: Record<string, TeachingCategory[]> = typedThemeData.reduce(
  (accumulator, theme) => {
    for (const item of theme.items) {
      const categories = accumulator[item.title] ?? []
      categories.push(normalizeOriginalCategoryName(theme.headingCn))
      accumulator[item.title] = categories
    }
    return accumulator
  },
  {} as Record<string, TeachingCategory[]>,
)

const LEGACY_TEXT_REPLACEMENTS: Array<[string, string]> = [
  ["比較", "比较"],
  ["並列", "并列"],
  ["不確定", "不确定"],
  ["徹底", "彻底"],
  ["斷言", "断言"],
  ["對比", "对比"],
  ["對立", "对立"],
  ["範圍", "范围"],
  ["感覺", "感觉"],
  ["根據", "根据"],
  ["關聯", "关联"],
  ["後悔", "后悔"],
  ["話題", "话题"],
  ["基準", "基准"],
  ["假設", "假设"],
  ["建議", "建议"],
  ["結果", "结果"],
  ["盡力", "尽力"],
  ["經驗", "经验"],
  ["驚嘆", "感叹"],
  ["驚訝", "惊讶"],
  ["決定", "决定"],
  ["開始", "开始"],
  ["禮貌", "礼貌"],
  ["立場", "立场"],
  ["列舉", "列举"],
  ["沒影響", "没影响"],
  ["判斷", "判断"],
  ["批評", "批评"],
  ["頻率", "频率"],
  ["評價", "评价"],
  ["請求", "请求"],
  ["確認", "确认"],
  ["條件", "条件"],
  ["推測", "推测"],
  ["無視", "无视"],
  ["無用", "无用"],
  ["許可", "许可"],
  ["選擇", "选择"],
  ["樣子", "样子"],
  ["疑問", "疑问"],
  ["影響", "影响"],
  ["允許", "允许"],
  ["重複", "重复"],
  ["狀況", "状况"],
  ["狀態", "状态"],
  ["比較", "比较"],
  ["並列", "并列"],
  ["關聯", "关联"],
  ["沒影響", "没影响"],
  ["否定", "否定"],
  ["傳聞", "传闻"],
  ["輕視", "轻视"],
  ["時刻", "时刻"],
  ["手段", "手段"],
  ["正在", "正在"],
  ["之後", "之后"],
  ["忠告", "忠告"],
  ["追加", "追加"],
  ["最佳", "最佳"],
  ["制御不能", "忍不住"],
]

const LEGACY_TAG_ALIASES: Record<string, TeachingCategory> = Object.fromEntries(
  LEGACY_TEXT_REPLACEMENTS.map(([legacy, current]) => [legacy, current as TeachingCategory]),
) as Record<string, TeachingCategory>

type LegacyTeachingCategory =
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

const LEGACY_CATEGORY_TO_ORIGINAL: Record<LegacyTeachingCategory, TeachingCategory> = {
  判断否定: "断言",
  疑问指示: "疑问",
  并列列举选择: "并列",
  原因理由: "原因",
  条件假设: "条件",
  转折让步: "对立",
  时间顺序时点: "期间",
  比较程度: "程度",
  意志愿望请求建议: "必要",
  推测传闻样态: "可能性",
  授受受益: "关联",
  限定范围数量: "范围",
  形式名词名词化: "状态",
  句尾表达语气: "感叹",
  动作状态结果存续: "状态",
  敬语书面表达: "礼貌",
  高阶书面逻辑: "根据",
}


function normalizeTitle(title: string): string {
  return title
    .replace(/^[～]/, "〜")
    .replace(/\s+/g, " ")
    .trim()
}


function normalizeTag(tag: string): string {
  return LEGACY_TEXT_REPLACEMENTS.reduce(
    (text, [legacy, current]) => text.split(legacy).join(current),
    tag.replace(/^N\d+\s*/u, "").trim(),
  )
}


function containsAny(target: string, patterns: string[]): boolean {
  return patterns.some((pattern) => target.includes(pattern))
}


function classifyLegacyTeachingCategory(title: string, tag: string | null): LegacyTeachingCategory {
  const source = `${tag ?? ""} ${title}`

  if (
    containsAny(source, ["判斷", "判断", "否定"]) ||
    title === "〜は〜です" ||
    title === "〜は〜だ" ||
    title.includes("では ない") ||
    title.includes("では ありません")
  ) {
    return "判断否定"
  }
  if (containsAny(source, ["疑問", "これ", "それ", "あれ", "どれ", "どこ", "だれ", "なに", "なん", "どう", "どのぐらい", "いつ"])) {
    return "疑问指示"
  }
  if (containsAny(source, ["並立", "列舉", "选择", "選擇", "〜と（並立）", "〜や", "〜とか", "〜か（並立）", "たり", "だり"])) {
    return "并列列举选择"
  }
  if (containsAny(source, ["原因", "理由", "から", "ので", "ため", "せい", "おかげ"])) {
    return "原因理由"
  }
  if (containsAny(source, ["仮定", "假設", "假设", "條件", "条件", "〜ば", "〜なら", "〜たら", "ことには", "ない限り", "場合", "限り", "とき", "際"])) {
    return "条件假设"
  }
  if (containsAny(source, ["逆接", "對立", "转折", "轉折", "讓步", "让步", "けれど", "けれども", "しかし", "でも", "のに", "ものの", "ながらも", "とはいえ", "ても", "ても", "たが", "けど"])) {
    return "转折让步"
  }
  if (containsAny(source, ["時刻", "順序", "時間", "前", "後", "とき", "間", "最中", "以来", "際", "た途端", "矢先", "次第", "たび"])) {
    return "时间顺序时点"
  }
  if (containsAny(source, ["比較", "程度", "一番", "より", "ほど", "くらい", "ぐらい", "過ぎ", "過ぎる", "主に"])) {
    return "比较程度"
  }
  if (containsAny(source, ["願望", "請求", "提議", "建議", "たい", "ほしい", "ください", "ませんか", "ましょう", "たらどう", "もらえますか", "くれますか", "必要", "なさい", "てください", "てもいい", "ても いい", "なくても いい"])) {
    return "意志愿望请求建议"
  }
  if (containsAny(source, ["傳聞", "传闻", "推測", "樣態", "状态", "狀態", "比喻", "らしい", "みたい", "そうだ", "ようだ", "かもしれない", "に違いない", "に相違ない", "と思う", "だろう", "はず", "っぽい"])) {
    return "推测传闻样态"
  }
  if (containsAny(source, ["授受", "受益", "あげる", "くれる", "もらう", "やる", "いただく", "させていただく"])) {
    return "授受受益"
  }
  if (containsAny(source, ["限定", "範圍", "范围", "数量", "しか", "だけ", "のみ", "限り", "ばかり", "ほどのことではない", "ずつ", "まで", "だけでなく"])) {
    return "限定范围数量"
  }
  if (containsAny(source, ["もの", "こと", "のだ", "んだ", "というもの", "ということ", "わけ", "はず", "つもり", "たち", "人", "ら"])) {
    return "形式名词名词化"
  }
  if (containsAny(source, ["終助詞", "句尾", "語氣", "語气", "確認", "強調", "ね", "よ", "わ", "かな", "かしら", "の（終助詞）", "もん"])) {
    return "句尾表达语气"
  }
  if (containsAny(source, ["て いる", "ている", "て ある", "てある", "て しまう", "てしまう", "て いく", "ていく", "て くる", "てくる", "結果", "存續", "存续", "状態", "状态", "上がる", "込む", "続ける", "始める", "終わる", "おく", "みる", "ぶり", "っぷり"])) {
    return "动作状态结果存续"
  }
  if (containsAny(source, ["敬語", "尊敬", "謙讓", "谦让", "丁寧", "礼貌", "よろしいでしょうか", "いただけますか", "お言葉に甘えて", "におかれましては", "で有名だ", "有名だ"])) {
    return "敬语书面表达"
  }
  return "高阶书面逻辑"
}


function resolveLegacyFallback(title: string, tag: string | null): TeachingCategory {
  const legacyCategory = classifyLegacyTeachingCategory(title, tag)
  return LEGACY_CATEGORY_TO_ORIGINAL[legacyCategory]
}


function resolveCategoryFromCandidates(
  candidates: TeachingCategory[] | undefined,
  tag: string | null,
): TeachingCategory | null {
  if (!candidates || candidates.length === 0) {
    return null
  }

  if (candidates.length === 1) {
    return candidates[0]
  }

  if (!tag) {
    return null
  }

  const normalizedTag = normalizeTag(tag)
  const tokens = normalizedTag.split(/[\s・、,，/／]+/u).filter(Boolean)

  for (const token of tokens) {
    const alias = LEGACY_TAG_ALIASES[token]
    if (alias && candidates.includes(alias)) {
      return alias
    }
  }

  for (const candidate of candidates) {
    if (tokens.includes(candidate)) {
      return candidate
    }
  }

  for (const candidate of candidates) {
    if (normalizedTag.includes(candidate)) {
      return candidate
    }
  }

  return null
}


export function classifyTeachingCategory(title: string, _tag: string | null): TeachingCategory {
  const normalized = normalizeTitle(title)
  const direct = TITLE_TO_CATEGORIES[normalized]
  const directResolved = resolveCategoryFromCandidates(direct, _tag)
  if (directResolved) {
    return directResolved
  }

  if (direct?.length === 1) {
    return direct[0]
  }

  const suffixes = ["", " ★★★", " ★★☆", " ★★", " ★☆", " ★"]
  for (const suffix of suffixes) {
    const candidate = TITLE_TO_CATEGORIES[normalizeTitle(`${normalized}${suffix}`)]
    const resolved = resolveCategoryFromCandidates(candidate, _tag)
    if (resolved) {
      return resolved
    }
  }

  return resolveLegacyFallback(normalized, _tag)
}


export function buildCategoryOrder(level: JLPTLevel, order: number): number {
  const levelOrder: Record<JLPTLevel, number> = {
    N5: 1,
    N4: 2,
    N3: 3,
    N2: 4,
    N1: 5,
  }

  return levelOrder[level] * 1000 + order
}
