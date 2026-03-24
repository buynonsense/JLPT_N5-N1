# JLPT Grammar Obsidian

在 Obsidian 中学习 JLPT N5～N1 文法。

## 功能

- 内置完整文法资料（N5～N1）
- 按教学功能分类学习，按等级浏览
- 勾选学习进度、继续学习、跳转正文

## Quickstart

1. 插件文件夹放到 `.obsidian/plugins/jlpt-grammar-obsidian/`
2. 在 `设置 → 社区插件` 中启用
3. 命令面板执行 `初始化文法库`
4. 执行 `打开学习面板`，开始学习

## 开发

```bash
npm install
npm run dev     # 监听模式
npm test        # 运行测试
npm run build   # 生产构建
```

## 主要命令

| 命令 | 说明 |
|------|------|
| 初始化文法库 | 写入内置文法资料到 vault |
| 打开学习面板 | 打开侧边栏学习面板 |
| 继续学习 | 从上次位置继续 |
