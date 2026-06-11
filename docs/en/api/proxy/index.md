# LLM Proxy API

The LLM Proxy API is the model-facing compatibility layer under `/v1/*`. It accepts OpenAI / Anthropic compatible requests and applies authentication, policy checks, audit processing, request logging, format conversion, and upstream routing.

## Base URL

```text
https://your-domain/v1
```

For local development:

```text
http://localhost:3000/v1
```

## Authentication

OpenAI compatible format:

```http
Authorization: Bearer <key>
```

Anthropic compatible format:

```http
x-api-key: <key>
```

Both formats are accepted. Available models, client types, and source IP ranges are controlled by the policy attached to the key.

## Compatible Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/chat/completions` | OpenAI Chat Completions compatible endpoint |
| POST | `/v1/responses` | OpenAI Responses API compatible endpoint |
| POST | `/v1/messages` | Anthropic Messages compatible endpoint |
| GET | `/v1/models` | Model list |

Request and response schemas should follow the official OpenAI / Anthropic documentation. LLM Fence documents only the proxy-specific behavior around auth, policy checks, audit, logging, and routing.

## Model List

`GET /v1/models` returns the configured model list.

- Without a key: returns all configured models
- With a valid key: filters models by policy

The response includes `supported_formats`, indicating which request formats the model supports.

## Streaming

Set `"stream": true` in the request body to enable SSE streaming.

The streaming format follows the request format:

- OpenAI compatible requests return OpenAI compatible SSE
- Anthropic compatible requests return Anthropic compatible SSE

Configured format conversion also applies to streaming responses.

## Errors

Proxy API errors use the OpenAI compatible error shape:

```json
{
  "error": {
    "message": "invalid api key",
    "type": "invalid_request_error"
  }
}
```

Common status codes:

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid key |
| 403 | Disabled key or failed policy check |
| 404 | Model not found |
| 500 | Upstream or internal error |

## Request Tracking

Every response includes an `x-request-id` header. Use it to look up logs and troubleshoot requests.
