# 管理后台

::: warning 临时方案
当前管理后台为临时过渡方案，基于 Python FastAPI，后续将重构。目前仅用于内部运维和调试，不建议对外暴露。
:::

独立的管理后台，连接与代理相同的 MongoDB，提供用量监控、Key 管理、请求日志查询和审计日志查看。

## 快速开始

```bash
pip install -r admin/requirements.txt
python admin/app.py                     # 默认 http://localhost:8000/admin
python admin/app.py -c other.yaml       # 指定配置文件
```

## 配置

在 `config.yaml` 中添加：

```yaml
admin:
  host: "127.0.0.1"              # 监听地址，默认 0.0.0.0
  port: 8000                     # 监听端口，默认 8000
  key: "<admin-access-key>"     # 访问密钥，不配则无需认证
  super_key: "<super-key>"      # 管理操作二次认证密钥
  key_management: true           # 开启 Key 管理接口，默认 false
```

## 页面

| 路由 | 说明 |
|------|------|
| `/admin/dashboard` | 仪表盘：概览卡片 + 请求趋势图 + 按模型/Key 分布图 |
| `/admin/keys` | Key 管理：启禁、策略编辑、重新生成、删除 |
| `/admin/logs` | 请求日志：按日期/Key/模型/状态码/错误信息筛选，分页查看 |
| `/admin/stats` | 用量统计：按 Key/模型分组，堆叠柱状图 + 排行榜 |
| `/admin/audit` | 审计日志：AI 审计结果查看，按状态/引擎筛选 |

## 认证机制

登录采用 challenge-response 方式，密钥不以明文传输：

1. 客户端请求 `GET /admin/api/challenge` 获取一次性 nonce（5 分钟有效）
2. 客户端计算 `SHA-256(challenge:key)` 发送 `POST /admin/login`
3. 服务端验证后设置 httpOnly session cookie（24 小时有效）

管理操作（启禁/删 Key）需要 `key_management: true` 开启 + `super_key` 二次认证。

## API 参考

所有数据 API 前缀 `/admin/api/`，返回 JSON。除 `/admin/api/challenge` 和 `/admin/api/config` 外均需认证。

### 概览与统计

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/admin/api/overview?days=7` | 概览数据 |
| GET | `/admin/api/stats/trend?days=7` | 请求趋势 |
| GET | `/admin/api/stats/by-key?days=7` | 按 Key 分组统计 |
| GET | `/admin/api/stats/by-model?days=7` | 按模型分组统计 |
| GET | `/admin/api/stats/by-key-model?days=7` | Key × 模型交叉数据 |

### Key 管理

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/admin/api/keys` | Key 列表（脱敏） |
| GET | `/admin/api/keys/last-used` | 各 Key 最后使用时间 |
| GET | `/admin/api/keys/activity` | 单 Key 活动热力图 |
| PUT | `/admin/api/keys/{key_id}/status` | 启禁 Key |
| PUT | `/admin/api/keys/{key_id}/policy` | 编辑策略 |
| PUT | `/admin/api/keys/{key_id}/regenerate` | 重新生成 Key 值 |
| DELETE | `/admin/api/keys/{key_id}` | 删除 Key |

### 日志

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/admin/api/logs` | 分页请求日志 |
| GET | `/admin/api/audit/logs` | 分页审计日志 |
| GET | `/admin/api/audit/config` | 审计模块配置状态 |

### 其他

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/admin/api/challenge` | 获取一次性 challenge nonce |
| GET | `/admin/api/config` | 返回 `key_management` 开关和 processor 状态 |

## 架构

```
app.py           FastAPI 入口，页面路由 + 数据 API
auth.py          challenge-response 认证 + Cookie 会话
config.py        读取 config.yaml
policy_registry.py 策略字段注册表
db.py            MongoDB 聚合查询、Key CRUD
templates/
  base.html        侧边栏布局 + 全局 JS 工具
  login.html       登录页
  dashboard.html   仪表盘
  keys.html        Key 管理
  logs.html        请求日志
  stats.html       用量统计
  audit.html       审计日志
```
