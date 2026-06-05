# 架构总览

LLM Fence 是一个基于 Rust 的 LLM API 代理服务器，位于 OpenAI/Anthropic 兼容客户端和上游 LLM 提供商之间。

## 请求链路

### 标准请求

```
Client → ConfigInjector → AuthMiddleware → PipelineHoop → handler
                                                            ↓
                                             ModelResolver.resolve_model()
                                                            ↓
                                             AdapterFactory.create()
                                                            ↓
                                                LlmAdapter → 上游
```

### 格式转换开启时

```
Client → ... → PreProcessor(FormatConverter) → Adapter → 上游
                                                           ↓
          Client ← PostProcessor(FormatConverter) ← ───────┘
```

## 各层职责

### 入口层

**`src/main.rs`** — 组装 Salvo 服务器、中间件链和路由。

- 注册路由：`POST /v1/chat/completions`、`POST /v1/responses`、`POST /v1/messages`、`GET /v1/models`
- `PipelineHoop` 将处理器管道注入 depot
- 设置 body 大小限制为 100MB

### 配置层

**`src/config/mod.rs`** — 反序列化 `config.yaml`，支持运行时热加载。

- `notify` crate 跨平台监听文件变更
- `Arc<RwLock<Config>>` 原子替换，provider 列表和模型映射即时生效
- 所有字符串值支持 `${ENV_VAR}` 占位符

**`src/config/watcher.rs`** — 后台异步任务，500ms 消抖后重新加载，内置重试应对 Windows 编辑器文件锁。

### 认证层

**`src/middleware/auth.rs`** — 认证中间件，支持双格式：

- OpenAI：`Authorization: Bearer <key>`
- Anthropic：`x-api-key: <key>`

从 MongoDB `api_keys` 集合查询 key；缺失/无效返回 401，已禁用返回 403。

### 路由层

**`src/router/resolver.rs`** — 遍历配置中的 provider model 列表，将客户端请求的模型名映射到 `(ProviderConfig, ModelConfig)` 对。

### 适配器层

**`src/adapter/`** — 上游适配器抽象：

| 文件 | 职责 |
|------|------|
| `base.rs` | `LlmAdapter` trait 定义 |
| `factory.rs` | 适配器工厂（LazyLock HTTP Client） |
| `format/generic.rs` | 通用格式处理器，按 endpoint 自动切换认证和 URL |
| `provider/newapi.rs` | NewAPI 适配器 |
| `provider/deepseek.rs` | DeepSeek 适配器（含 `/anthropic/v1` 前缀路由） |
| `provider/llm_fence.rs` | llm-fence 链式转发适配器 |

### 处理器层

**`src/handler/chat.rs`** — 通用转发端点：
- 解析 JSON body，执行 `accept` 格式校验
- 通过 `pipeline.run_pre()` 执行 PreProcessor 链
- 路由到 provider 并转发请求
- 非流式响应经 `run_post()` 改写后返回
- `pipeline.observe(record)` 异步记录日志

**`src/handler/models.rs`** — 模型列表端点，并发拉取上游 `/models` 并过滤。

### 处理器管道

**`src/processor/`** — 可插拔三阶段管道：

```
PreProcessor (请求前)  → PostProcessor (响应后)  → Observer (旁路)
```

| 处理器 | 阶段 | 功能 |
|--------|------|------|
| `client_guard` | Pre | 客户端类型识别与白名单校验 |
| `model_guard` | Pre | 模型白名单校验 |
| `ip_guard` | Pre | IP/CIDR 白名单校验 |
| `format_converter` | Pre + Post | Anthropic ↔ OpenAI 格式互转 |
| `request_logger` | Observer | 异步请求日志写入 MongoDB |
| `audit` | Observer | AI 旁路审计分析 |

### 格式转换引擎

**`src/format/`** — `FormatTranslator` trait 抽象：

- `translate_request` / `translate_response` — 请求/响应转换
- `stream_translator` — 流式转换（SSE 逐 chunk）
- 当前由 `anyllm_translate` crate 实现

### 数据库层

**`src/db/`** — MongoDB 连接和操作：
- `mongo.rs` — 连接管理
- `client_key.rs` — API Key CRUD
- `request_log.rs` — 请求日志结构和仓储
- `audit_log.rs` — 审计日志结构和仓储

## 项目结构

```
src/
  main.rs                      # 入口
  config/mod.rs                # 配置加载 + 热加载
  config/watcher.rs            # 文件监听
  error_response.rs            # OpenAI 兼容 JSON 错误
  middleware/auth.rs            # 双格式认证
  router/resolver.rs            # 模型名 → provider 映射
  adapter/
    base.rs                    # LlmAdapter trait
    factory.rs                 # 适配器工厂
    format/generic.rs          # 通用格式处理器（双 base_url）
    provider/newapi.rs         # NewAPI 适配器
    provider/deepseek.rs       # DeepSeek 适配器
    provider/llm_fence.rs      # 链式转发适配器
  handler/
    chat.rs                    # 通用转发端点
    models.rs                  # 模型列表端点
  processor/
    mod.rs                     # Pipeline + 三 trait
    key/client_guard.rs        # 客户端类型守卫
    key/model_guard.rs          # 模型白名单守卫
    key/ip_guard.rs             # IP 白名单守卫
    format_converter.rs         # 格式互转处理器
    request_logger.rs           # 请求日志记录器
    audit/                      # AI 审计模块
  format/
    mod.rs                     # FormatTranslator trait
    anyllm_impl.rs             # anyllm_translate 实现
  db/
    mongo.rs                   # MongoDB 连接
    client_key.rs               # API Key CRUD
    request_log.rs             # 请求日志
    audit_log.rs               # 审计日志
```

## 主要依赖

| Crate | 用途 |
|-------|------|
| `salvo` | Web 框架 |
| `mongodb` | API Key / 日志存储 |
| `reqwest` | 上游 HTTP 调用 |
| `serde` / `serde_yaml` | 配置反序列化 |
| `tracing` / `tracing-subscriber` | 结构化日志 |
| `anyllm_translate` | Anthropic ↔ OpenAI 格式互译 |
| `openssl` | Linux 静态链接 TLS |
