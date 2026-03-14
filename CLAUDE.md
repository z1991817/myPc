## CLAUDE.md
 
## 项目概述
 
**项目名称** artImg Pro - Ai 图片处理工具  
**当前版本**：v 0.0.1 
**项目状态**：生产环境运行，正在开发v0.0.1新功能
 
**业务目标**：为用户提供方便便利的图片处理工具
**核心价值**：简单易用、实时协作、数据安全
 
## 技术栈
**前端**：
- react + heroui + tailwindcss 4 
 
## 开发指令
- npm run dev
- npm run build
 
## 架构和约束
- 所有新增组件都要用到heroui的组件，不要自己定义
- 所有接口都维护到api文件下方
- 所有组件必须使用TypeScript
- 组件文件采用PascalCase命名
- Props接口统一定义在组件顶部
- 所有对话必须使用中文交流
- 功能开发完成后自测
- 功能开发完成后优化代码
- 注释写全
- 调优代码，删除冗余代码
- 我不需要nuxt的后端服务，不要启动nuxt的服务器
- 后端服务地址：http://localhost:3000（配置在.env文件中的NUXT_PUBLIC_API_BASE_URL）
## 当前任务
[tasks]