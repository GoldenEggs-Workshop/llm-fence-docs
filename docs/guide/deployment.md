# 编译与部署

## 从源码编译

### 环境要求

- **Rust 工具链**：安装 [rustup](https://rustup.rs/)

### 编译

```bash
# 发布版
cargo build --release

# 带 debug 诊断（仅 client_guard）
cargo build --features client_guard_debug --release
```

二进制文件位于 `target/release/`：

- Linux：`target/release/llm-fence`
- Windows：`target/release/llm-fence.exe`

### 构建特性

| Feature | 说明 |
|---------|------|
| `client_guard_debug` | 编译时开启严格检查失败诊断。生产构建不启用，避免泄露验证方式 |

```bash
cargo build --features client_guard_debug        # Debug 模式
cargo build                                        # 生产构建
```

## 跨平台部署

LLM Fence 支持跨平台部署，无需额外运行时依赖：

- **Linux** — musl 静态编译，兼容 CentOS 7+、Ubuntu 20.04+（内核 2.6.32+）
- **Windows** — 静态 CRT，无需 `vcruntime140.dll`

### 本地打包

```bash
cargo build --release
```

直接将二进制文件和配置文件复制到目标机器即可运行。

## 启动配置

### 日志级别

通过 `RUST_LOG` 环境变量控制：

```bash
RUST_LOG=debug ./llm-fence     # Debug 级别日志（含认证、路由、耗时详情）
RUST_LOG=off ./llm-fence       # 关闭日志
# 不设 = 默认 info 级别
```

### 基本运行

```bash
# 需要 config.yaml 在运行目录
./llm-fence
```

## Linux 部署

### Systemd 服务

```ini
[Unit]
Description=LLM API Proxy
After=network-online.target mongod.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/llm-fence
ExecStart=/opt/llm-fence/llm-fence
Restart=on-failure
RestartSec=5

# 可选：环境变量
Environment=RUST_LOG=info

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now llm-fence
```

### 日志查看

```bash
journalctl -u llm-fence -f    # 实时日志
journalctl -u llm-fence -n 100  # 最近 100 行
```

## Windows 部署

直接运行可执行文件：

```powershell
.\llm-fence.exe
```

或注册为 Windows 服务（通过 `sc` 命令或第三方工具如 NSSM）。

## 运行测试

```bash
# Rust 单元测试
cargo test

# 集成测试（需要 Python）
pip install -r tests/requirements.txt

# 上游直连测试
python tests/direct/test_openai.py
python tests/direct/test_anthropic.py -b http://localhost:3000 -k <key> -m deepseek-chat

# 调试代理（抓包）
python tests/debug/debug_proxy.py
python tests/debug/debug_proxy.py --format anthropic
python tests/debug/dump_upstream.py -k <api-key>
```

## 运维注意事项

- `config.yaml` 和 API Key 不要提交到版本控制，项目 `.gitignore` 已排除这些文件
- 上游 API Key 建议通过环境变量注入，避免明文写在配置文件中
- 管理后台的 `admin.key` 建议配置，特别是 `admin.host` 非 `127.0.0.1` 时
- MongoDB 建议开启认证和 TLS
- 审计模块采样率建议从低值开始（如 0.05），根据审计 LLM 负载调整
