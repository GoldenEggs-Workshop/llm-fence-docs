# LLM 代理 API

LLM 代理 API 是面向模型客户端的兼容层，路径前缀为 `/v1/*`。它用于承接 OpenAI / Anthropic 兼容请求，并在转发前后执行鉴权、策略校验、审计、日志记录、格式转换和上游路由。

## Base URL

```text
https://your-domain/v1
```

本地开发环境通常是：

```text
http://localhost:3000/v1
```

## 认证

OpenAI 兼容格式：

```http
Authorization: Bearer <key>
```

Anthropic 兼容格式：

```http
x-api-key: <key>
```

两种格式可混用，服务器会自动识别。实际可用模型、客户端类型和来源 IP 由 Key 对应策略决定。

## 兼容端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/chat/completions` | OpenAI Chat Completions 兼容接口 |
| POST | `/v1/responses` | OpenAI Responses API 兼容接口 |
| POST | `/v1/messages` | Anthropic Messages 兼容接口 |
| GET | `/v1/models` | 模型列表 |

请求体和响应体优先参考 OpenAI / Anthropic 官方文档。LLM Fence 不重新定义这些通用 schema，只补充自身在认证、策略、审计、日志和路由上的行为。

## 模型列表

`GET /v1/models` 返回配置范围内的模型列表。

- 未携带 Key：显示全部配置模型
- 携带有效 Key：按策略中的允许模型过滤

响应中会包含 `supported_formats` 字段，用于标识模型支持的请求格式。

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1710000000,
      "owned_by": "my-provider",
      "supported_formats": ["openai", "anthropic"]
    }
  ]
}
```

## 流式响应

请求体中设置 `"stream": true` 即启用 SSE 流式传输。

流式响应格式与入口格式一致：

- OpenAI 兼容请求返回 OpenAI 兼容 SSE
- Anthropic 兼容请求返回 Anthropic 兼容 SSE

如果配置了格式转换，流式响应同样会被转换。

## 错误响应

代理 API 统一返回 OpenAI 兼容错误结构：

```json
{
  "error": {
    "message": "invalid api key",
    "type": "invalid_request_error"
  }
}
```

常见状态码：

| 状态码 | 说明 |
|--------|------|
| 401 | Key 缺失或无效 |
| 403 | Key 已禁用，或策略校验失败 |
| 404 | 模型未找到 |
| 500 | 上游错误或内部异常 |

## 请求追踪

每个请求都会返回 `x-request-id` 响应头，格式为 `req_` 加 UUID，可用于日志查询和问题排查。
