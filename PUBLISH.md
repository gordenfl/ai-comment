# 发布 VSCode 插件到官方市场指南

本指南将帮助你将 AI Comment Generator 插件发布到 VSCode 官方市场（Visual Studio Code Marketplace）。

## 前置准备

### 1. 创建 Azure DevOps 账号

VSCode 市场使用 Azure DevOps 进行身份验证和发布管理。

1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 使用 Microsoft 账号登录（如果没有，需要先注册）
3. 创建一个组织（Organization）

### 2. 创建 Personal Access Token (PAT)

1. 登录 Azure DevOps 后，点击右上角用户头像
2. 选择 **Security** → **Personal access tokens**
3. 点击 **New Token**
4. 配置 Token：
   - **Name**: 输入一个名称，如 "VSCode Extension Publishing"
   - **Organization**: 选择你的组织
   - **Expiration**: 设置过期时间（建议至少 1 年）
   - **Scopes**: 选择 **Custom defined**
     - 勾选 **Marketplace** → **Manage**
5. 点击 **Create**
6. **重要**: 复制生成的 Token（只显示一次，请妥善保存）

### 3. 创建发布者（Publisher）

1. 访问 [Visual Studio Marketplace 发布者管理页面](https://marketplace.visualstudio.com/manage)
2. 使用 Microsoft 账号登录
3. 点击 **Create Publisher**
4. 填写信息：
   - **Publisher ID**: 输入唯一的发布者 ID（如：`yourname` 或 `your-company-name`）
     - 只能包含小写字母、数字、连字符和下划线
     - 一旦创建无法修改
   - **Publisher Name**: 显示名称（可以修改）
   - **Support URL**: 支持页面 URL（可选）
5. 点击 **Create**

### 4. 更新 package.json

在发布前，需要更新 `package.json` 中的以下字段：

```json
{
  "publisher": "your-publisher-id",  // 替换为你在步骤 3 中创建的 Publisher ID
  "author": {
    "name": "Your Name"  // 替换为你的名字
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/ai-comment.git"  // 替换为你的仓库地址
  },
  "homepage": "https://github.com/yourusername/ai-comment#readme",
  "bugs": {
    "url": "https://github.com/yourusername/ai-comment/issues"
  }
}
```

## 安装发布工具

安装 Visual Studio Code Extension Manager (vsce)：

```bash
npm install -g @vscode/vsce
```

或者使用 npx（不需要全局安装）：

```bash
npx @vscode/vsce package
```

## 发布步骤

### 1. 准备发布

确保代码已编译：

```bash
npm run compile
```

### 2. 打包插件

生成 `.vsix` 文件：

```bash
npm run package
# 或
vsce package
```

这会生成 `ai-comment-0.1.0.vsix` 文件。

### 3. 测试打包文件（可选但推荐）

在发布前，可以手动安装 `.vsix` 文件进行测试：

1. 在 VSCode 中，打开扩展面板（`Cmd/Ctrl + Shift + X`）
2. 点击右上角的 `...` 菜单
3. 选择 **Install from VSIX...**
4. 选择生成的 `.vsix` 文件
5. 测试插件功能是否正常

### 4. 发布到市场

#### 方法一：使用命令行发布（推荐）

```bash
npm run publish
# 或
vsce publish
```

首次发布时会要求输入：
- **Personal Access Token**: 输入步骤 2 中创建的 PAT

#### 方法二：通过网页上传

1. 访问 [Visual Studio Marketplace 发布者管理页面](https://marketplace.visualstudio.com/manage)
2. 点击 **New extension** → **Visual Studio Code**
3. 上传生成的 `.vsix` 文件
4. 填写扩展信息（大部分信息会自动从 package.json 读取）
5. 点击 **Save** 保存草稿，或点击 **Publish** 直接发布

### 5. 验证发布

发布成功后：

1. 访问你的扩展页面：`https://marketplace.visualstudio.com/items?itemName=your-publisher-id.ai-comment`
2. 等待几分钟让市场索引更新
3. 在 VSCode 中搜索 "AI Comment Generator" 验证是否可找到

## 更新版本

当需要发布新版本时：

1. 更新 `package.json` 中的 `version` 字段（遵循 [语义化版本](https://semver.org/)）：
   ```json
   "version": "0.1.1"  // 例如：修复 bug 用 0.1.1，新功能用 0.2.0
   ```

2. 编译并打包：
   ```bash
   npm run compile
   npm run package
   ```

3. 发布：
   ```bash
   npm run publish
   ```

## 重要提示

### 版本号规则

- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

例如：`1.2.3` → `1.2.4`（修复）或 `1.3.0`（新功能）或 `2.0.0`（重大变更）

### 安全检查

发布前确保：

- ✅ 没有硬编码的 API 密钥
- ✅ 没有敏感信息
- ✅ README 完整且准确
- ✅ 所有依赖都已正确声明
- ✅ 代码已通过编译和测试

### 常见问题

**Q: 发布失败，提示 "Publisher not found"**
A: 检查 `package.json` 中的 `publisher` 字段是否与你在市场创建的 Publisher ID 完全一致。

**Q: 如何撤销已发布的版本？**
A: 在 [发布者管理页面](https://marketplace.visualstudio.com/manage) 找到你的扩展，可以取消发布（Unpublish），但已下载的用户仍可使用。

**Q: 可以发布私有扩展吗？**
A: VSCode 市场只支持公开扩展。如果需要私有扩展，可以：
- 使用 `.vsix` 文件手动分发
- 使用私有扩展市场（如 GitHub Packages）

## 发布清单

发布前检查清单：

- [ ] 更新 `package.json` 中的 `publisher`、`author`、`repository` 等信息
- [ ] 确保代码已编译（`npm run compile`）
- [ ] 测试插件功能正常
- [ ] README.md 完整且准确
- [ ] 版本号已更新
- [ ] 已创建 Azure DevOps 账号和 Publisher
- [ ] 已准备好 Personal Access Token
- [ ] 已安装 `@vscode/vsce`

## 参考资源

- [VSCode 扩展发布文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
- [语义化版本规范](https://semver.org/)

---

祝你发布顺利！🎉

