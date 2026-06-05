# 快速开始

LLM Fence 是一个轻量级的 LLM API 代理，在你的客户端和上游 LLM 提供商之间提供认证、路由、策略控制和审计。

## 前置条件

- **MongoDB**：用于存储 API Key、请求日志和审计记录。建议 MongoDB 4.4+。
- **Python 3**（可选）：仅管理后台和调试脚本需要。

## 安装

从 [GitHub Releases](https://github.com/GoldenEggs-Workshop/llm-fence/releases) 下载对应平台的 zip 包，解压即用：

- **Windows**：`llm-fence.exe`
- **Linux**：`llm-fence`（静态编译，无需系统依赖）

## 最小化配置

在解压目录创建 `config.yaml`，最少需要三部分：

```yaml
server:
  host: "0.0.0.0"
  port: 3000

mongo:
  uri: "mongodb://localhost:27017"
  db: "llm_fence"

providers:
  - name: my-provider
    type: newapi
    api_key: "<上游 API Key>"
    base_url: "https://your-upstream/v1"
    models:
      - name: gpt-4o
```

::: tip 环境变量
所有字符串值支持 `${ENV_VAR}` 占位符，启动时自动替换：

```yaml
api_key: "${OPENAI_API_KEY}"
uri: "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:27017"
```
:::

## 准备 API Key

在 MongoDB 的 `api_keys` 集合中插入一个 Key 记录：

```json
{
  "name": "team-key-1",
  "client_key": "sk-your-secret-key",
  "status": "active",
  "policy": {}
}
```

你可以直接通过 MongoDB Shell 插入，或通过管理后台操作（[见管理后台文档](/guide/admin)）。

## 启动

```bash
# Windows
llm-fence.exe

# Linux
chmod +x llm-fence
./llm-fence
```

看到以下输出表示启动成功：

```
llm-fence v0.6.2
listening on http://0.0.0.0:3000
```

## 测试

```bash
# OpenAI 格式
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer sk-your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"hello"}]}'

# Anthropic 格式
curl -X POST http://localhost:3000/v1/messages \
  -H "x-api-key: sk-your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":128,"messages":[{"role":"user","content":"hello"}]}'
```

## 下一步

- [配置指南](/guide/configuration) — 完整的配置项说明
- [上游提供商](/guide/providers) — 配置 DeepSeek、链式转发等多个提供商
- [Key 与策略](/guide/keys-and-policies) — 按 Key 精细控制访问权限
