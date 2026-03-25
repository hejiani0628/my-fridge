# 🧊 My Fridge - 智能冰箱管家

一个基于 **PWA (Progressive Web App)** 技术和 **AI 大模型** 构建的轻量级冰箱食材管理工具。

## ✨ 核心功能
- **📸 AI 视觉识别**：接入通义千问 VL 模型，拍照即可自动识别食材名称、分类及建议保质期。
- **⏳ 智能临期排序**：算法根据“购买日期+保质期”自动计算剩余天数，快过期的食材永远排在最前面。
- **🍳 私厨菜谱推荐**：AI 根据冰箱现有库存（自动过滤过期食材）生成创意食谱，告别“今天吃什么”的烦恼。
- **⭐ 菜谱收藏夹**：一键保存 AI 生成的灵感，支持离线查看。
- **📱 原生 App 体验**：支持 PWA，可“添加到主屏幕”作为独立 App 使用，拥有专属蓝色冰箱图标。

## 🛠️ 技术栈
- **前端**：HTML5, CSS3 (Glassmorphism UI), JavaScript (Vanilla JS)
- **后端**：Vercel Serverless Functions (Node.js)
- **AI 能力**：阿里云 DashScope (Qwen-VL-Max / Qwen-Turbo)
- **存储**：Browser LocalStorage (确保隐私，数据不上传服务器)

## 🚀 快速部署
1. **Fork 本仓库** 到你的 GitHub。
2. 在 [Vercel](https://vercel.com) 中导入该项目。
3. 在 Vercel 项目设置中添加环境变量：
   - `DASHSCOPE_API_KEY`: 你的阿里云 API 密钥。
4. 部署完成后，在手机浏览器打开链接，点击“添加到主屏幕”即可安装。

---
*由 Gemini 协作开发 - 2026*
