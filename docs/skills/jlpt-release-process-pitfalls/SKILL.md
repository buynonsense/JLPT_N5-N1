---
name: jlpt-release-process-pitfalls
description: This skill should be used when the user asks to "发版", "发布 v0.x", "同步 package.json 和 manifest.json", "打 zip 包", "创建 GitHub Release", or mentions build/tag/release steps.
---

# JLPT 发版流程坑总结

用于处理版本号同步、构建产物、打包、打 tag 和发布 Release 时容易踩的坑。

## 关键结论

- 先同步 `package.json` 和 `manifest.json` 的版本号，再开始发版流程。
- 如果仓库里有 `package-lock.json`，把根版本也保持一致，避免版本信息互相打架。
- 先跑 `npm test`，再跑 `npm run build`，不要跳过验证直接发版。
- 插件发布产物只保留 `main.js`、`manifest.json`、`styles.css` 和 release zip。

## 操作流程

1. 更新版本号。
2. 跑测试，确认没有回归。
3. 跑构建，确认产物可生成。
4. 打 zip 包。
5. 提交代码并创建 tag。
6. 推送主分支和 tag。
7. 用 `gh release create` 发布，并把 zip 和三件产物一起附上。

## 常见坑

- 只改 `package.json`，忘记改 `manifest.json`。
- 构建成功后忘记重新复制到 vault，误以为已更新。
- 只看本地状态，没确认工作区是否干净。
- 发布说明写成流水账，没保留“这次为什么改”这一层。
- 产物文件放错，导致 release 内容不完整。

## 发布说明风格

- 标题写成 `v0.x.y 更新`。
- 列表只写 3 到 4 条，优先写结果和用户收益。
- 每条尽量是“修复 / 优化 / 同步 / 清理”这类动词开头。
- 不要在发布说明里堆太多实现细节。

## 校验方式

- 确认 `npm test` 通过。
- 确认 `npm run build` 通过。
- 确认 `git status` 干净。
- 确认 tag 已推送，release 页面已生成。
