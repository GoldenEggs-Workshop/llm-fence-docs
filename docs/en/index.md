---
layout: home

hero:
  name: "LLM Fence"
  text: "LLM API Proxy for Teams"
  tagline: Secure, controlled access to multiple LLM providers
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: Configuration
      link: /en/guide/configuration

features:
  - title: High Performance
    details: Built in Rust on the Salvo async framework. Low memory footprint, fast startup, native high-concurrency streaming.
  - title: Client-Level Identification
    details: Auto-detect Claude Code, OpenAI Codex, and other clients. Allow or block specific clients per API key.
  - title: Fine-Grained Policy Control
    details: Three-dimensional control — Key × Client Type × Model × IP CIDR. Least-privilege access for every team member.
  - title: Pluggable Pipeline
    details: PreProcessor / PostProcessor / Observer architecture. Extend with a single trait implementation.
  - title: AI Audit
    details: Async LLM-powered analysis of request/response content, with per-client-type preprocessing pipelines.
  - title: Cross-Platform
    details: Static musl builds for Linux (CentOS 7+, Ubuntu 20.04+), static CRT for Windows. Single binary, simple deployment.
---

::: warning Documentation Notice
The project is under rapid iteration. Documentation may lag behind or be outdated. When in doubt, refer to the <a href="https://github.com/GoldenEggs-Workshop/llm-fence" target="_blank">source code</a>.
:::

::: warning Under Construction
English documentation is being translated. Some pages may be incomplete. [中文文档](/) is the most up-to-date.
:::
