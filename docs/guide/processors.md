# 处理器管道

LLM Fence 的核心功能通过**可插拔处理器管道**实现。三个处理阶段 — PreProcessor、PostProcessor、Observer — 在请求/响应的不同生命周期介入，实现认证校验、策略控制、格式转换和日志记录。

## 三阶段架构

```
Client → Auth → Pipeline ── PreProcessor  → Adapter → Upstream
                        │                              ↓
                        └── PostProcessor ← ───────────┘
                         ↘
                          Observer (异步，不阻塞)
```

| 阶段 | Trait | 时机 | 用途 |
|------|-------|------|------|
| **PreProcessor** | `process(&mut Value)` | 请求转发前 | 校验/改写请求体 |
| **PostProcessor** | `process(&mut Value)` | 响应返回前 | 过滤/改写响应体 |
| **Observer** | `observe(RequestRecord)` | 请求完成后 | 旁路日志/异步分析 |

PostProcessor 支持流式响应：通过 `stream_processor()` 工厂创建 `StreamProcessor`，逐 chunk 处理 SSE 事件。

## 处理器列表

### client_guard — 客户端类型守卫

PreProcessor。通过请求头 + 请求体多信号综合识别客户端类型，并与 Key 的 `allowed_clients` 白名单比对。

识别的客户端类型：
- `"codex"` / `"codex-lenient"` — OpenAI Codex（严格/宽松）
- `"cc"` / `"cc-lenient"` — Claude Code（严格/宽松）
- `"audit"` — 审计引擎内部请求（HMAC 证明）
- `"unknown"` — 无法识别

```yaml
processors:
  client_guard:
    enabled: true
    detection:
      codex: true           # Codex 客户端检测
      cc: true              # Claude Code 客户端检测
      audit:                # 审计内部请求检测
        enabled: false
        secret: ""          # HMAC 密钥
```

::: tip Debug 模式
编译时开启 `client_guard_debug` feature 可诊断严格检查失败的原因：

```bash
cargo build --features client_guard_debug
```

生产构建不启用，避免泄露验证方式。
:::

### model_guard — 模型白名单守卫

PreProcessor。从 `policy.allowed_models` 读取模型白名单，校验请求 model 是否在允许范围内。

```yaml
processors:
  model_guard:
    enabled: true
```

Key 策略配置：

```json
{
  "allowed_models": ["gpt-4o", "claude-sonnet-4-20250514"]
}
```

白名单为空或未配置 → 放行所有模型。

### ip_guard — IP 白名单守卫

PreProcessor。从 `policy.allowed_ips` 读取 IP/CIDR 白名单，校验客户端 IP。

支持单 IP（`1.2.3.4`）和 CIDR 网段（`10.0.0.0/8`、`192.168.1.0/24`），IPv4/IPv6 均可。

IP 来源优先级：

1. `Key-Client-IP` 请求头（CDN 自定义头）
2. `X-Forwarded-For` 请求头（反向代理，取第一个）
3. `remote_addr`（直连兜底）

```yaml
processors:
  ip_guard:
    enabled: true
```

Key 策略配置：

```json
{
  "allowed_ips": ["10.0.0.0/8", "192.168.1.100"]
}
```

白名单为空或未配置 → 放行所有 IP。

### format_converter — 格式互转

同时实现 PreProcessor、PostProcessor 和 StreamProcessor。负责 Anthropic ↔ OpenAI 格式互转。

仅处理 `send` 方向（将请求/响应转为上游格式），`accept` 校验已在 handler 层独立执行。

```yaml
processors:
  format_converter:
    enabled: true
```

转换细节：
- 请求体/响应体双向转换
- SSE 流式逐 chunk 转换
- `cache_control` 保留
- `thinking` type 归一化（`adaptive` → `enabled`）
- endpoint 自动同步

### request_logger — 请求日志记录器

Observer。将 `RequestRecord` 异步写入 MongoDB `request_logs` 集合，不阻塞主链路。

记录内容：
- 本地 `request_id` + 上游 `upstream_request_id`
- Key 名称、请求模型、上游模型、提供商
- 流式/非流式、耗时、客户端类型、请求端点
- Token 用量（cache_hit / prompt / completion）
- 错误信息

```yaml
processors:
  request_logger:
    enabled: true
```

### audit — AI 审计

Observer。旁路异步分析请求/响应内容。详细介绍见 [AI 审计模块](/guide/audit)。

```yaml
processors:
  audit:
    enabled: false                        # 默认关闭
    import_file: "audit_config.yaml"        # 独立配置文件
```

## 处理器开关

所有处理器均可通过 `enabled` 字段独立开关。未在配置中声明的处理器**默认启用**（审计模块除外，默认关闭）。

```yaml
processors:
  client_guard:
    enabled: false     # 关闭客户端校验
  # model_guard 未配置 → 默认启用
  # ip_guard 未配置 → 默认启用
```

开关状态通过 `Arc<RwLock<Config>>` 共享，热加载即时生效，无需重启。

## 扩展新处理器

实现对应的 trait 后在 `build_pipeline()` 注册即可，handler 无需改动：

1. 实现 `PreProcessor`、`PostProcessor` 或 `Observer` trait
2. 在 `Pipeline` 构建函数中注册
3. 在 `config.yaml` 中添加开关

```rust
// 示例：一个 PreProcessor
struct MyGuard;

#[async_trait]
impl PreProcessor for MyGuard {
    async fn process(&self, body: &mut Value, ctx: &ProcessContext) -> Result<()> {
        // 校验/改写逻辑
        Ok(())
    }
}
```
