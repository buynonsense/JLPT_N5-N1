# JLPT N5-N1

在 Obsidian 中学习 JLPT N5～N1 文法。

## 功能

- 内置完整文法资料（N5～N1）
- 分类学习（手风琴折叠）与等级浏览
- 勾选学习进度、继续学习、跳转正文
- 今日目标 todo 列表（最多 3 条）

## Quickstart

1. 从 [Releases](https://github.com/buynonsense/JLPT_N5-N1/releases) 下载最新版本
2. 解压 `main.js`、`manifest.json`、`styles.css` 到 `.obsidian/plugins/jlpt-n5-n1/`
3. 设置 → 社区插件 → 启用 `JLPT N5-N1`
4. 命令面板执行 `初始化文法库`
5. 执行 `打开学习面板`

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
