# Key 与策略

LLM Fence 通过 MongoDB `api_keys` 集合管理 API Key，每个 Key 可附加细粒度的访问策略。

## Key 结构

```json
{
  "name": "team-key-1",
  "client_key": "sk-abc123...",
  "status": "active",
  "policy": {
    "allowed_clients": ["cc"],
    "allowed_models": ["gpt-4o", "claude-sonnet-4-6"],
    "allowed_ips": ["10.0.0.0/8"]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 归属标识（冗余写入 `request_logs.token_name`） |
| `client_key` | string | 认证用的密钥值 |
| `status` | string | `"active"` 或 `"disabled"` |
| `policy` | object | schema-less JSON，按需配置 |

## 策略字段

`policy` 为 schema-less JSON，支持以下字段：

| 字段 | 类型 | 对应处理器 | 说明 |
|------|------|-----------|------|
| `allowed_clients` | `string[]` | `client_guard` | 限制可访问的客户端类型 |
| `allowed_models` | `string[]` | `model_guard` | 限制可调用的模型 |
| `allowed_ips` | `string[]` | `ip_guard` | 限制可访问的 IP/网段 |

**空数组或未配置表示不限制**。

## 客户端限制

限制 Key 只能被特定客户端使用：

```json
{
  "allowed_clients": ["cc"]
}
```

可选值：
- `"cc"` / `"cc-lenient"` — Claude Code
- `"codex"` / `"codex-lenient"` — OpenAI Codex
- `"audit"` — 审计引擎内部请求

配合 `client_guard` 处理器使用，需要 `processors.client_guard.enabled: true`。

## 模型限制

限制 Key 能调用的模型列表：

```json
{
  "allowed_models": ["gpt-4o", "gemini-3-flash"]
}
```

对 `/v1/models` 端点也生效：携带 Key 时只返回该 Key 允许的模型。

## IP 限制

限制 Key 的访问来源 IP：

```json
{
  "allowed_ips": ["1.2.3.4", "10.0.0.0/8", "192.168.1.0/24"]
}
```

支持单 IP 和 CIDR 网段，IPv4/IPv6 均可。

## 组合策略

三个维度可任意组合：

```json
{
  "allowed_clients": ["cc"],
  "allowed_models": ["gpt-4o"],
  "allowed_ips": ["10.0.0.0/8", "192.168.1.100"]
}
```

只有 **所有策略都通过**时才放行请求。

## Key 管理

### 通过管理后台

启动管理后台并开启 `key_management: true`，在 Web UI 中可视化管理 Key。

详见[管理后台](/guide/admin)。

### 直接操作 MongoDB

```javascript
// 创建 Key
db.api_keys.insertOne({
  name: "dev-team-key",
  client_key: "sk-secret-abc123",
  status: "active",
  policy: {
    allowed_models: ["gpt-4o"],
    allowed_ips: ["10.0.0.0/8"]
  }
})

// 禁用一个 Key
db.api_keys.updateOne(
  { name: "dev-team-key" },
  { $set: { status: "disabled" } }
)

// 修改策略
db.api_keys.updateOne(
  { name: "dev-team-key" },
  { $set: { "policy.allowed_models": ["gpt-4o", "gemini-3-flash"] } }
)
```

MongoDB 修改即时生效（处理器在下一次请求时读取最新数据）。

## 数据说明

- `request_logs.token_name` 是 `api_keys.name` 的冗余副本，在请求时写入，之后不再关联 `api_keys`
- 删除 Key 不影响历史统计和日志查询
- 若创建同名新 Key，新旧用量会混在一起
