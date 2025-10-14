# 诗词鉴赏平台（前端）

本项目基于 Vue 3 + Vite + TypeScript，遵循 .cursorrules 与《需求文档.md》规范。
- 技术栈：Vue3（Composition API）、Vue Router、Pinia、Vite、TypeScript、ESLint+Prettier、Vitest
- 目录结构：src/api、src/components/Hello、src/pages/home、src/stores、src/utils
- 路由：/home
- 网络请求：基于 axios 的统一封装（src/api/http.ts）

## 快速开始
1. 安装依赖
   npm install
2. 启动开发
   npm run dev
3. 构建与预览
   npm run build
   npm run preview

## 规范与约定
- 组件：通用组件以 Base 前缀命名，业务组件按域分类；Props/Emits 使用 TS 类型；支持插槽，必要时 defineExpose。
- 网络请求：不在组件直接调用 axios，统一通过 api 层；拦截器负责认证与错误处理。
- Store：Pinia 组织状态，组合式函数承载业务逻辑。
- 类型检查：npm run typecheck。

请参考 .cursorrules 获取更详细的开发流程与约束。