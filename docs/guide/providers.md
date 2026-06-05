# 上游提供商

LLM Fence 通过适配器模式支持多种上游提供商。每个 provider 可以配置独立的 API Key、base URL 和模型列表。

## 适配器类型

| 类型 | 说明 |
|------|------|
| `newapi` | NewAPI / OneAPI 等 OpenAI 兼容上游 |
| `deepseek` | DeepSeek 官方 API |
| `llm-fence` | 另一个 llm-fence 实例（链式转发） |

三种适配器均原生支持 OpenAI 和 Anthropic 双格式认证和转发，按 endpoint 自动切换认证方式（Bearer / x-api-key）和 URL，无需额外配置。

## NewAPI

最常见的场景 — 上游是类 OpenAI API 服务。

```yaml
providers:
  - name: newapi-main
    type: newapi
    api_key: "${UPSTREAM_API_KEY}"
    base_url: "https://your-upstream/v1"
    models:
      - name: gemini-3-flash
      - name: gpt-5.2
        upstream_model: gpt-5.2-preview   # 上游模型名不同时指定映射
```

客户端可用 OpenAI 或 Anthropic 两种格式请求，adapter 自动切换认证和 URL，原样透传。

## DeepSeek

DeepSeek 适配器自动处理双格式路由：

- 客户端 POST `/v1/chat/completions` → `{base_url}/chat/completions`
- 客户端 POST `/v1/messages` → `{base_url}/anthropic/v1/messages`

```yaml
providers:
  - name: deepseek
    type: deepseek
    api_key: "${DEEPSEEK_API_KEY}"
    base_url: "https://api.deepseek.com"
    models:
      - name: deepseek-v4-pro
      - name: deepseek-v4-flash
```

::: warning 注意
DeepSeek 适配器不支持 `/models` 端点，会自动触发 config 降级——从本地配置构造默认模型元数据。
:::

## llm-fence 链式转发

将请求原样转发给另一个 llm-fence 实例，适用于多级代理链、跨网络转发、权限分层隔离。

```yaml
providers:
  - name: upstream-proxy
    type: llm-fence
    api_key: "${UPSTREAM_FENCE_KEY}"
    base_url: "http://another-llm-fence:3000/v1"
    models:
      - name: gpt-5.2
```

上游 llm-fence 用自己的 MongoDB `api_keys` 做认证，自动按 endpoint 选择认证方式。

## 格式控制

每个 provider 和 model 均可配置 `accept` 和 `send` 字段，控制格式的接收和发送。

### accept — 客户端可用格式

限制客户端可以使用的 API 格式。

```yaml
accept: openai                  # 单字符串，等价于 [openai]
accept: [openai, anthropic]     # 允许多种格式
```

不配则默认 `[openai, anthropic]`，两种格式都允许。

### send — 发给上游的格式

统一转换请求格式后再发送给上游。

```yaml
send: openai       # 统一转为 OpenAI 格式发给上游
send: anthropic    # 统一转为 Anthropic 格式发给上游
# 不写 send        # 不转换，原样透传
```

::: tip 级联规则
model 配置覆盖 provider 配置。model 不配 `accept`/`send` 则继承 provider。
:::

### 示例

```yaml
providers:
  - name: my-provider
    type: newapi
    api_key: "${API_KEY}"
    base_url: "https://api.example.com/v1"
    accept: openai                          # provider 级只允许 OpenAI 格式
    send: openai                            # provider 级统一转为 OpenAI
    models:
      - name: gpt-4o
        # 继承 provider 的 accept/send

      - name: claude-sonnet-4-6
        accept: [openai, anthropic]          # 这个模型也允许 Anthropic
        send: openai                         # 但 Anthropic 请求也会转为 OpenAI 发给上游
```

### accept 校验

`accept` 校验在 handler 层执行，**始终生效**，不受 `format_converter` processor 开关影响。

### send 格式转换

`send` 格式转换仅在 `format_converter.enabled: true` 时执行。关闭时请求以原始格式原样透传，adapter 层会自动按 endpoint 切换认证和 URL（Anthropic → `x-api-key` + `anthropic-version`）。

## 模型名映射

当客户端使用的模型名与上游实际模型名不同时，使用 `upstream_model` 覆盖：

```yaml
models:
  - name: gpt-5.2                    # 客户端请求这个名
    upstream_model: gpt-5.2-preview  # 上游实际收到的名
```

不填 `upstream_model` 则直接使用 `name` 作为上游模型名。

## 添加新提供商

需要实现 `LlmAdapter` trait 并在 `AdapterFactory` 注册。详见[架构总览](/guide/architecture#适配器层)。
