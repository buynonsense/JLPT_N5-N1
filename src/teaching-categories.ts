import type { JLPTLevel, TeachingCategory } from "./types"


export const CATEGORY_ORDER: TeachingCategory[] = [
  "判断否定",
  "疑问指示",
  "并列列举选择",
  "原因理由",
  "条件假设",
  "转折让步",
  "时间顺序时点",
  "比较程度",
  "意志愿望请求建议",
  "推测传闻样态",
  "授受受益",
  "限定范围数量",
  "形式名词名词化",
  "句尾表达语气",
  "动作状态结果存续",
  "敬语书面表达",
  "高阶书面逻辑",
]

const LEVEL_ORDER: Record<JLPTLevel, number> = {
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
}

const CATEGORY_OVERRIDES: Record<string, TeachingCategory> = {
  "〜のに": "转折让步",
  "〜ものの": "转折让步",
  "〜ても・〜でも": "转折让步",
  "〜て ください": "意志愿望请求建议",
  "〜そうだ（伝聞）": "推测传闻样态",
}


function includesAny(target: string, patterns: string[]): boolean {
  return patterns.some((pattern) => target.includes(pattern))
}


export function classifyTeachingCategory(title: string, tag: string | null): TeachingCategory {
  const override = CATEGORY_OVERRIDES[title]
  if (override) {
    return override
  }
  const source = `${tag ?? ""} ${title}`

  if (
    includesAny(source, ["判斷", "判断", "否定"]) ||
    title === "〜は〜です" ||
    title === "〜は〜だ" ||
    title.includes("では ない") ||
    title.includes("では ありません")
  ) {
    return "判断否定"
  }
  if (includesAny(source, ["疑問", "これ", "それ", "あれ", "どれ", "どこ", "だれ", "なに", "なん", "どう", "どのぐらい", "いつ"])) {
    return "疑问指示"
  }
  if (includesAny(source, ["並立", "列舉", "選擇", "〜と（並立）", "〜や", "〜とか", "〜か（並立）"])) {
    return "并列列举选择"
  }
  if (includesAny(source, ["原因", "理由", "〜から", "〜ので", "ため", "せいで", "おかげで"])) {
    return "原因理由"
  }
  if (includesAny(source, ["仮定", "條件", "条件", "〜と（仮定・条件）", "〜ば", "〜なら", "〜たら", "ことには", "ない限り", "ばこそ"])) {
    return "条件假设"
  }
  if (includesAny(source, ["逆接", "對立", "轉折", "让步", "けれど", "けれども", "しかし", "でも", "のに", "ものの", "ながらも", "とはいえ"])) {
    return "转折让步"
  }
  if (includesAny(source, ["時刻", "順序", "時間", "前", "後", "とき", "間", "最中", "以来", "際", "た途端", "矢先"])) {
    return "时间顺序时点"
  }
  if (includesAny(source, ["比較", "程度", "一番", "より", "ほど", "くらい", "ぐらい", "過ぎ", "過ぎる"])) {
    return "比较程度"
  }
  if (includesAny(source, ["願望", "請求", "提議", "建議", "〜たい", "ほしい", "ください", "ませんか", "ましょう", "たらどう", "てもらえますか", "くれますか"])) {
    return "意志愿望请求建议"
  }
  if (includesAny(source, ["傳聞", "传闻", "推測", "樣態", "状態", "比喩", "らしい", "みたい", "そうだ", "ようだ", "かもしれない", "に違いない", "に相違ない"])) {
    return "推测传闻样态"
  }
  if (includesAny(source, ["授受", "受益", "あげる", "くれる", "もらう", "やる", "いただく", "させていただく"])) {
    return "授受受益"
  }
  if (includesAny(source, ["限定", "範圍", "範囲", "数量", "しか", "だけ", "のみ", "限り", "ばかり", "ほどのことではない"])) {
    return "限定范围数量"
  }
  if (includesAny(source, ["もの", "こと", "のだ", "んだ", "というもの", "ということ", "わけ", "はず", "つもり"])) {
    return "形式名词名词化"
  }
  if (includesAny(source, ["終助詞", "句尾", "語氣", "確認", "強調", "〜ね", "〜よ", "〜わ", "〜かな", "〜かしら", "〜の（終助詞）", "〜もん（終助詞）"])) {
    return "句尾表达语气"
  }
  if (includesAny(source, ["て いる", "て ある", "て しまう", "て いく", "て くる", "結果", "存續", "状態", "上がる", "込む", "続ける", "始める", "終わる"])) {
    return "动作状态结果存续"
  }
  if (includesAny(source, ["敬語", "尊敬", "謙讓", "丁寧", "よろしいでしょうか", "いただけますか", "お言葉に甘えて", "におかれましては"])) {
    return "敬语书面表达"
  }
  if (includesAny(source, ["書面", "高級", "高阶", "逻辑", "論理", "に即して", "に則して", "に準じて", "べく", "に至って", "に足りる", "に及ばない"])) {
    return "高阶书面逻辑"
  }
  return "动作状态结果存续"
}


export function buildCategoryOrder(level: JLPTLevel, order: number): number {
  return LEVEL_ORDER[level] * 1000 + order
}
