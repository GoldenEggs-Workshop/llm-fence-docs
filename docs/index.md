---
layout: home

hero:
  name: "LLM Fence"
  text: "面向团队的 LLM API 代理"
  tagline: 解决 LLM 使用中的审计合规和权限管理问题
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 配置指南
      link: /guide/configuration

features:
  - title: 高性能
    details: Rust 实现，基于 Salvo 异步框架，内存占用低，启动快。原生支持高并发流式转发，OpenAI / Anthropic 双格式兼容。
  - title: 客户端级别识别
    details: 自动区分 Claude Code、OpenAI Codex 等客户端类型，可按 Key 粒度放行或拦截特定客户端，精确控制谁能用什么工具访问 LLM。
  - title: 细粒度策略控制
    details: Key → 客户端类型 × 模型 × IP 网段三维度组合控制。为团队内不同成员按需分配最小权限。
  - title: 可插拔管道
    details: PreProcessor / PostProcessor / Observer 三阶段架构，功能模块自由组合，扩展新策略只需实现一个 trait。
  - title: AI 审计
    details: 旁路异步 LLM 分析请求/响应内容，支持按客户端类型分流预处理。可用于合规检查和安全监控，异常请求主动告警。
  - title: 跨平台
    details: Linux musl 静态编译，兼容 CentOS 7+、Ubuntu 20.04+ 等；Windows 静态 CRT 无需 vcruntime。单个二进制文件，部署简单。
---
