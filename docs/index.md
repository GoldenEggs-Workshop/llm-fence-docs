---
layout: home

hero:
  name: "LLM Fence"
  text: "面向团队的 LLM API 代理"
  tagline: 专注 LLM 使用中的审计合规与权限管理
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 配置指南
      link: /guide/configuration

features:
  - title: 高性能
    details: Rust 实现，基于 Salvo 异步框架，内存占用低、启动快。原生支持高并发流式转发，OpenAI / Anthropic 双格式兼容。
  - title: 客户端级别识别
    details: 自动区分 Claude Code、OpenAI Codex 等客户端类型，按 Key 粒度放行或拦截，精确控制谁能用什么工具访问 LLM。
  - title: 细粒度策略控制
    details: Key → 客户端类型 × 模型 × IP 网段三维组合控制，为团队成员按需分配最小权限。
  - title: 可插拔管道
    details: PreProcessor / PostProcessor / Observer 三阶段架构，模块自由组合，扩展新策略只需实现一个 trait。
  - title: AI 审计
    details: 旁路异步 LLM 分析请求 / 响应内容，按客户端类型分流预处理，用于合规检查与安全监控，异常请求主动告警。
  - title: 跨平台部署
    details: Linux musl 静态编译，兼容 CentOS 7+、Ubuntu 20.04+；Windows 静态 CRT 无需 vcruntime。单个二进制，部署简单。
---

::: warning 文档时效性
项目正在快速迭代，文档可能滞后于实现。如有出入，请以 [源码](https://github.com/GoldenEggs-Workshop/llm-fence) 为准。
:::