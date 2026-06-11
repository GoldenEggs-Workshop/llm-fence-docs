# API 参考

LLM Fence 的接口分为两类：

- [管理 API](/api/admin/)：管理后台与外部运维系统使用的控制面接口，路径前缀为 `/api/admin/*`。
- [LLM 代理 API](/api/proxy/)：兼容 OpenAI / Anthropic 的模型调用接口，路径前缀为 `/v1/*`。

如果你要接入控制台、查询日志、统计用量或管理 Key，请查看管理 API。

如果你要把现有 OpenAI / Anthropic 客户端接入 LLM Fence，请查看 LLM 代理 API。
