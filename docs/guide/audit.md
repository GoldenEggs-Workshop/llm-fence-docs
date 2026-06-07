# AI 审计模块

AI 审计是一个 Observer 阶段的旁路分析模块，将请求/响应内容发送到外部审计 LLM 进行合规检查和安全监控。

作为 Observer 运行，审计完全不阻塞主请求链路 — 采样判断、入队、分析全链路异步。

## 快速配置

**第一步**：在 `config.yaml` 中启用审计：

```yaml
processors:
  audit:
    enabled: true
    import_file: "audit_config.yaml"
```

**第二步**：复制 `audit_config.example.yaml` 为 `audit_config.yaml`，填入审计 LLM 连接信息：

```yaml
sample_rate: 0.05          # 全局采样率 5%

engines:
  llm:
    enabled: true
    url: "http://localhost:3000/v1/chat/completions"
    api_key: "${YOUR_API_KEY}"
    model: "deepseek-v4-flash"
    max_tokens: 2048
    system_prompt: "@audit_prompt.txt"
```

::: warning 注意
审计配置文件修改后需**手动重启**才能生效，不支持热加载。
:::

## 架构总览

```
请求完成 → AuditReporter(Observer)
              ↓
         采样判断（确定性哈希）
              ↓
         入队 bounded queue
              ↓
         round-robin 分发到 worker pool
              ↓
         独立客户端检测
              ↓
         预处理管道（按客户端类型分流）
              ↓
         截断
              ↓
         调用审计 LLM
              ↓
         批量写入 MongoDB（Sink）
```

## 配置参考

完整配置项见 [`audit_config.example.yaml`](https://github.com/GoldenEggs-Workshop/llm-fence/blob/main/audit_config.example.yaml)。

### 全局配置

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `sample_rate` | `1.0` | 全局采样率 0.0~1.0 |
| `worker_count` | `2` | Worker 并发数 |
| `queue_size` | `1024` | 主队列容量，满了丢弃并打印 warning |
| `worker_queue_size` | `256` | 每个 worker 内部队列容量 |

### 第一层截断

对原始 body 做硬截断（预处理器之前执行）：

```yaml
body_limits:
  max_request_chars: -1     # -1=不限制, 0=不发送
  max_response_chars: -1
```

### LLM 引擎

```yaml
engines:
  llm:
    enabled: true
    sample_rate: 1.0             # 引擎级采样率，叠加全局
    timeout_secs: 60
    url: "http://localhost:3000/v1/chat/completions"
    api_key: "${AUDIT_LLM_KEY}"
    model: "deepseek-v4-flash"
    max_tokens: 2048
    thinking: false
    system_prompt: "@audit_prompt.txt"   # @开头=读文件

    # 审计请求 HMAC 证明
    audit_proof:
      enabled: false
      secret: ""
```

### 采样率计算

实际采样率 = 全局 `sample_rate` × 引擎级 `sample_rate`。

基于 `request_id` 的确定性哈希采样，同一请求多次经过时结果一致。

## 预处理管道

审计模块内置独立的客户端检测（不依赖 `client_guard` processor），按客户端类型分流到不同预处理管线，减少审计 LLM 的输入噪音。

### 默认管线

```yaml
preprocess:
  enabled: true
  pipelines:
    default:
      enabled: true
      processors:
        - type: merge_streaming       # SSE 流合并为单条文本
        - type: format_messages       # JSON → "[role] content" 纯文本
```

### Claude Code 管线

CC 管线包含 4 种额外预处理器：

```yaml
pipelines:
  cc:
    enabled: true
    processors:
      - type: strip_system_prompt       # 只保留 "# Environment" 之后
      - type: strip_tools               # 去掉 tools + tool_use/tool_result
      - type: strip_system_reminder     # 去掉 <system-reminder> 块
      - type: reverse_truncate_messages  # 只保留最后 N 条消息
        config:
          max_chars: 10000
          max_messages: 20
          mode: "min"                    # min=取交集(更严), max=取并集
      - type: merge_streaming
      - type: format_messages
```

### Codex 管线

当前不做预处理（预留）：

```yaml
pipelines:
  codex:
    enabled: true
    processors: []
```

### 第二层截断

预处理器之后、发审计 LLM 之前执行：

```yaml
truncation:
  max_request_chars: 20000
  max_response_chars: 20000
```

## 审计证明

审计引擎可以为自己发出的请求附加 HMAC 签名，让 `client_guard` 识别这些请求为 `"audit"` 客户端类型：

1. 在 `audit_config.yaml` 中配置 `audit_proof.secret`
2. 在 `config.yaml` 中配置一致的同名 secret：

```yaml
# audit_config.yaml
audit_proof:
  enabled: true
  secret: "shared-secret"
```

```yaml
# config.yaml
processors:
  client_guard:
    detection:
      audit:
        enabled: true
        secret: "shared-secret"
```

## Sink — 结果存储

审计结果批量写入 MongoDB `audit_logs` 集合：

```yaml
sink:
  batch_size: 20                 # 批量写入大小
  flush_interval_secs: 5          # 定时刷盘间隔
```

## 查看审计结果

通过管理后台的 `/admin/audit` 页面查看审计日志，支持按状态和引擎筛选。也可直接查询 MongoDB：

```javascript
db.audit_logs.find({ status: "completed" }).sort({ created_at: -1 }).limit(10)
```
