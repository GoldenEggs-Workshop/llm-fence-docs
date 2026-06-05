import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "LLM Fence",
  description: "面向团队的 LLM API 代理，重点解决 LLM 使用中的审计合规和权限管理问题。提供 OpenAI / Anthropic 双格式兼容、细粒度策略控制、AI 旁路审计和客户端识别，帮助团队安全、可控地接入多个 LLM 提供商。",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '文档', link: '/guide/configuration' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '配置指南', link: '/guide/configuration' },
            { text: 'API 参考', link: '/guide/api' },
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '上游提供商', link: '/guide/providers' },
            { text: '处理器管道', link: '/guide/processors' },
            { text: 'Key 与策略', link: '/guide/keys-and-policies' },
            { text: 'AI 审计模块', link: '/guide/audit' },
          ]
        },
        {
          text: '运维',
          items: [
            { text: '管理后台', link: '/guide/admin' },
            { text: '架构总览', link: '/guide/architecture' },
            { text: '编译与部署', link: '/guide/deployment' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GoldenEggs-Workshop/llm-fence' }
    ]
  }
})
