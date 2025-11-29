# AI Comment Generator

一个强大的 VSCode 插件，使用 AI 为代码自动生成注释。支持 C++、Python、Lua、Java、JavaScript 和 TypeScript。

## 功能特性

- 🤖 使用 AI 自动生成代码注释
- 🌍 支持多种编程语言（C++、Python、Lua、Java、JavaScript、TypeScript）
- 📝 支持为选中代码或整个文件生成注释
- ⚙️ 可配置的 AI 服务提供商（OpenAI、Anthropic 等）
- 🌐 支持中英文注释生成
- ⚡ 智能缩进对齐，自动匹配代码风格
- 📊 进度指示器，实时显示生成状态
- 🛡️ 大文件警告，避免意外消耗过多 API 配额
- 🔄 配置热更新，修改设置后立即生效

## 安装

1. 在 VSCode 中打开扩展面板
2. 搜索 "AI Comment Generator"
3. 点击安装

或者从源码安装：

```bash
npm install
npm run compile
# 按 F5 在扩展开发宿主中运行
```

## 配置

**重要：在使用插件之前，必须先配置 AI API 密钥！**

### 快速配置

1. **方法一：通过命令面板**
   - 按 `Cmd/Ctrl + Shift + P` 打开命令面板
   - 输入 "AI Comment: Open Settings"
   - 配置你的 API 密钥

2. **方法二：通过设置界面**
   - 打开 VSCode 设置（`Cmd/Ctrl + ,`）
   - 搜索 "AI Comment"
   - 配置以下设置：
     - **ai-comment.apiProvider**: AI 服务提供商（openai、anthropic 或 custom）
     - **ai-comment.apiKey**: API 密钥（**必填**）
     - **ai-comment.model**: 使用的模型（默认：gpt-3.5-turbo）
     - **ai-comment.language**: 注释语言（auto、en、zh）

### 未配置时的提示

如果未配置 API 密钥，当你尝试生成注释时，插件会：

- 显示友好的提示信息
- 提供"打开设置"按钮，一键跳转到配置页面
- 不会执行任何操作，避免产生错误

### 配置示例

```json
{
  "ai-comment.apiProvider": "openai",
  "ai-comment.apiKey": "sk-your-api-key-here",
  "ai-comment.model": "gpt-3.5-turbo",
  "ai-comment.language": "auto"
}
```

### 获取 API 密钥

- **OpenAI**: 访问 [OpenAI API Keys](https://platform.openai.com/api-keys) 创建 API 密钥
- **Anthropic (Claude)**: 访问 [Anthropic API Keys](https://console.anthropic.com/settings/keys) 创建 API 密钥

## 使用方法

### 为选中代码生成注释

1. 选中要添加注释的代码
2. 使用快捷键 `Cmd+Shift+C` (Mac) 或 `Ctrl+Shift+C` (Windows/Linux)
3. 或者通过命令面板（`Cmd/Ctrl + Shift + P`）运行 "AI Comment: Generate Comment for Selection"

**注意**：如果未配置 API 密钥，会提示你进行配置。

### 为整个文件生成注释

1. 打开要添加注释的文件
2. 通过命令面板运行 "AI Comment: Generate Comments for Entire File"

**注意**：如果未配置 API 密钥，会提示你进行配置。

### 快速打开设置

- 通过命令面板运行 "AI Comment: Open Settings" 快速打开配置页面

## 支持的语言

- **C++** (cpp, c)
- **Python** (python)
- **Lua** (lua)
- **Java** (java)
- **JavaScript** (javascript, js)
- **TypeScript** (typescript, ts)

## 开发

### 项目结构

```
ai-comment/
├── src/
│   ├── extension.ts          # 主入口文件
│   ├── aiService.ts          # AI 服务集成
│   ├── commentGenerator.ts   # 注释生成器
│   └── languageSupport.ts    # 语言支持
├── package.json              # 插件配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 说明文档
```

### 构建

```bash
npm install
npm run compile
```

### 调试

1. 按 `F5` 打开新的扩展开发宿主窗口
2. 在新窗口中测试插件功能

### 打包

```bash
npm install -g vsce
vsce package
```

## 发布

如果你想将插件发布到 VSCode 官方市场，请查看 [PUBLISH.md](./PUBLISH.md) 获取详细的发布指南。

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### 0.1.0

- 初始版本
- 支持 C++、Python、Lua、Java、JavaScript、TypeScript
- 支持 OpenAI 和 Anthropic API
- 支持中英文注释生成
