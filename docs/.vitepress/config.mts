import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LLM Fence",
  description: "面向团队的 LLM API 代理，重点解决 LLM 使用中的审计合规和权限管理问题。提供 OpenAI / Anthropic 双格式兼容、细粒度策略控制、AI 旁路审计和客户端识别，帮助团队安全、可控地接入多个 LLM 提供商。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
