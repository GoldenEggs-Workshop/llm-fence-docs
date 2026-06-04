# 📘 项目文档

基于 [VitePress](https://vitepress.dev) 搭建的文档站点。

## 🔧 环境要求

- Node.js >= 18
- 包管理器：推荐 pnpm，也可使用 npm 或 yarn

## 🚀 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/GoldenEggs-Workshop/llm-fence-docs.git
cd llm-fence-docs

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm docs:dev
```

启动后浏览器访问 `http://localhost:5173` 即可实时预览文档。

## 📦 构建生产版本

```bash
pnpm docs:build
```

构建产物默认输出到 `docs/.vitepress/dist`，将该目录部署到服务器即可。

本地预览构建结果：

```bash
pnpm docs:preview
```

## ✍️ 编辑文档

直接在 `docs/` 下新建或修改 `.md` 文件，开发服务器会自动热更新。文件路径即对应网站的访问路径：

- `docs/index.md` → `/`
- `docs/guide/start.md` → `/guide/start`

更多写作技巧请参考[VitePress 官方文档](https://vitepress.dev/zh/)。

## 📄 许可

[Apache-2.0](LICENSE)