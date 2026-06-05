# API 参考

LLM Fence 提供 OpenAI 和 Anthropic 兼容的 API 端点。

## 认证

支持两种认证格式：

- **OpenAI**：`Authorization: Bearer <key>`
- **Anthropic**：`x-api-key: <key>`

两种格式可混用，服务器自动识别，无需额外配置。

## 端点

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/v1/chat/completions` | 必须 | 对话接口（OpenAI 兼容） |
| POST | `/v1/responses` | 必须 | Responses API |
| POST | `/v1/messages` | 必须 | Messages API（Anthropic 兼容） |
| GET | `/v1/models` | 可选 | 模型列表 |

所有端点均支持流式响应（`stream: true`）。

## GET /v1/models

返回配置范围内的模型列表。

- **无 Key**：显示全部配置模型
- **携带有效 Key**：按 `policy.allowed_models` 过滤

响应中包含 `supported_formats` 字段，指示模型支持的格式。

::: details 示例响应
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
:::

## POST /v1/chat/completions

OpenAI 兼容的对话端点。请求体与 OpenAI Chat Completions API 一致。

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer <your-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "hello"}],
    "stream": true
  }'
```

## POST /v1/messages

Anthropic 兼容的 Messages 端点。发往 `messages` 端点时，认证自动按 Anthropic 格式处理（`x-api-key` + `anthropic-version` 头）。

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "x-api-key: <your-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 128,
    "messages": [{"role": "user", "content": "hello"}]
  }'
```

## POST /v1/responses

OpenAI Responses API 兼容端点。

## 错误响应

所有错误统一返回 OpenAI 兼容的 JSON 格式：

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

## 流式响应

设置 `"stream": true` 即启用 SSE 流式传输。流式格式与请求格式一致（OpenAI 请求返回 OpenAI 格式的 SSE，Anthropic 请求返回 Anthropic 格式的 SSE）。

如果配置了格式转换（`send` 字段），流式响应同样会被转换。

## 请求追踪

每个请求返回 `x-request-id` 响应头（格式为 `req_` + UUID），可用于日志查询和问题排查。
