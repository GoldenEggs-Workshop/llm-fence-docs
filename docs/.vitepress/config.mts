import { defineConfig } from 'vitepress'

export default defineConfig({
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      title: 'LLM Fence',
      description: '面向团队的 LLM API 代理，重点解决 LLM 使用中的审计合规和权限管理问题。',
      head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
      ],
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '文档', link: '/guide/configuration' },
          { text: 'API', link: '/api/' }
        ],
        sidebar: {
          '/api': [
            {
              text: 'API 参考',
              items: [
                { text: 'API 参考', link: '/api/' },
              ]
            }
          ],
          '/guide/': [
            {
              text: '入门',
              items: [
                { text: '快速开始', link: '/guide/getting-started' },
                { text: '配置指南', link: '/guide/configuration' },
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
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'LLM Fence',
      description: 'LLM API proxy for teams — audit compliance, permission management, and secure multi-provider access.',
      head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
      ],
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Get Started', link: '/en/guide/getting-started' },
          { text: 'Docs', link: '/en/guide/configuration' },
          { text: 'API', link: '/en/api/' }
        ],
        sidebar: {
          '/en/api': [
            {
              text: 'API Reference',
              items: [
                { text: 'API Reference', link: '/en/api/' },
              ]
            }
          ],
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Quick Start', link: '/en/guide/getting-started' },
                { text: 'Configuration', link: '/en/guide/configuration' },
              ]
            },
            {
              text: 'Core Features',
              items: [
                { text: 'Providers', link: '/en/guide/providers' },
                { text: 'Processor Pipeline', link: '/en/guide/processors' },
                { text: 'Keys & Policies', link: '/en/guide/keys-and-policies' },
                { text: 'AI Audit', link: '/en/guide/audit' },
              ]
            },
            {
              text: 'Operations',
              items: [
                { text: 'Admin Panel', link: '/en/guide/admin' },
                { text: 'Architecture', link: '/en/guide/architecture' },
                { text: 'Deployment', link: '/en/guide/deployment' },
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/GoldenEggs-Workshop/llm-fence' }
    ]
  }
})
