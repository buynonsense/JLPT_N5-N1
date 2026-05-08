---
name: jlpt-reading-view-jump-pitfalls
description: This skill should be used when the user asks to "阅读视图跳转不生效", "预览模式点击章节没反应", "Obsidian 学习面板跳转", "openLinkText 锚点定位", or mentions reading-view heading jumps.
---

# JLPT 阅读视图跳转坑总结

用于处理学习面板跳到文法页时，阅读视图和编辑视图行为不一致的问题。

## 关键结论

- 优先按 `getMode() === "preview"` 判断阅读视图，不要只看 `editor` 是否存在。
- 不要依赖当前预览 DOM 里已经渲染出目标标题；目标章节可能根本不在可见树里。
- 在阅读视图里，优先用 `openLinkText(#标题, sourcePath)` 让 Obsidian 自己做锚点定位。
- 在编辑视图里，再沿用行号、光标和滚动计算逻辑。

## 操作流程

1. 打开目标文档后，先读取 `getMode()`。
2. 如果是 `preview`，直接走标题锚点跳转。
3. 如果是 `source`，再走编辑器定位。
4. 若标题匹配失败，优先检查标题字符串是否和 Markdown 原文一致。
5. 若预览页还是不跳，先怀疑渲染时机和 DOM 可见范围，不要先怀疑滚动算法。

## 常见坑

- 把阅读视图当成“没有 editor 的特殊模式”，结果误判。
- 试图从预览 DOM 里搜索所有标题，实际上只拿到当前可见章节。
- 过早做 DOM 查询，导致标题还没渲染出来。
- 为了“看起来更聪明”同时保留多条定位路径，最后反而更难排查。

## 校验方式

- 先打印 `mode`、`hasPreviewMode`、`hasEditor`、`headingText`。
- 再确认跳转是否进入锚点路径，而不是编辑器 fallback。
- 最后在 Obsidian 阅读视图里手工点一次，确认目标章节确实滚动到位。
