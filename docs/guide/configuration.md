# 配置指南

LLM Fence 使用单个 `config.yaml` 文件进行配置，启动时加载。配置文件支持热加载 — 修改后自动生效，无需重启。

完整配置示例见项目仓库的 [`config.example.yaml`](https://github.com/GoldenEggs-Workshop/llm-fence/blob/main/config.example.yaml)。

## 配置结构

```yaml
server:       # 必填 — 服务器监听
mongo:        # 必填 — MongoDB 连接
providers:    # 必填 — 上游提供商（至少一个）
processors:   # 可选 — 处理器开关
admin:        # 可选 — 管理后台
```

## 环境变量替换

所有字符串值支持 `${ENV_VAR}` 占位符，启动时自动替换为环境变量的值。若环境变量不存在则保留原文。

```yaml
api_key: "${OPENAI_API_KEY}"
uri: "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:27017"
```

## server

```yaml
server:
  host: "0.0.0.0"            # 监听地址
  port: 3000                  # 监听端口
  # upstream_timeout_secs: 120  # 上游请求超时秒数，默认 120
```

## mongo

```yaml
mongo:
  uri: "mongodb://localhost:27017"
  db: "llm_fence"
```

## providers

上游提供商列表，至少配置一个。每个 provider 包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 唯一标识 |
| `type` | string | 适配器类型：`newapi` / `deepseek` / `llm-fence` |
| `api_key` | string | 上游 API Key |
| `base_url` | string | 上游地址 |
| `models` | array | 模型列表 |
| `accept` | string/array | 客户端可用格式，默认 `[openai, anthropic]` |
| `send` | string | 发给上游的格式，不设则不转换 |

### 模型配置

每个 model 的配置项：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 客户端请求的模型名 |
| `upstream_model` | string | 发送到上游的模型名（不填则与 `name` 一致） |
| `accept` | string/array | 覆盖 provider 级的 accept 配置 |
| `send` | string | 覆盖 provider 级的 send 配置 |

::: tip 级联规则
model 配置覆盖 provider 配置。model 不配 `accept`/`send` 则继承 provider 的设置。
:::

详细的 provider 配置见[上游提供商](/guide/providers)章节。

## processors

处理器开关，按模块名逐项控制启用/禁用。**未配置的模块默认启用**（审计模块除外，默认关闭）。

```yaml
processors:
  client_guard:
    enabled: true
    detection:
      codex: true
      cc: true
      audit:
        enabled: false
        secret: ""
  model_guard:
    enabled: true
  ip_guard:
    enabled: true
  request_logger:
    enabled: true
  format_converter:
    enabled: true
  audit:
    enabled: false
    import_file: "audit_config.yaml"
```

::: warning 注意
`accept` 为 handler 层基础校验，始终生效不受 `format_converter` 开关影响。`send` 格式转换仅在 `format_converter.enabled: true` 时执行。
:::

详细介绍见[处理器管道](/guide/processors)章节。

## admin

管理后台配置（可选）：

```yaml
admin:
  host: "127.0.0.1"          # 监听地址，默认 0.0.0.0
  port: 8000                 # 监听端口，默认 8000
  key: "<admin-access-key>"  # 访问密钥，不设则无需认证
  super_key: "<super-key>"   # 高危操作二次认证密码
  key_management: true       # 允许通过 Web UI 创建/删除 Key，默认 false
```

详细介绍见[管理后台](/guide/admin)章节。

## 热加载

配置文件变更后自动热加载，无需重启：

- **监听范围**：`config.yaml` 的 Modify / Create / Remove 事件
- **消抖**：500ms 防抖，避免编辑器连续写入频繁触发
- **容错**：解析失败保留旧配置，内置 2 次重试应对 Windows 编辑器文件锁
- **即时生效**：provider 列表、模型映射、processor 开关即刻更新

::: warning
审计配置文件（`audit_config.yaml`）修改后需手动重启才能生效。
:::
