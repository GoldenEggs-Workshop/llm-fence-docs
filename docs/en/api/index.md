# API Reference

LLM Fence exposes two API surfaces:

- [Admin API](/en/api/admin/): control-plane endpoints for the admin console and operational integrations, under `/api/admin/*`.
- [LLM Proxy API](/en/api/proxy/): OpenAI / Anthropic compatible model invocation endpoints, under `/v1/*`.

Use the Admin API for console integration, logs, usage analytics, and key management.

Use the LLM Proxy API when connecting existing OpenAI or Anthropic clients to LLM Fence.
