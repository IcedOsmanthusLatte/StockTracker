# StockTracker 部署指南

## 推荐平台：Zeabur

Zeabur 是最适合你需求的部署平台：
- ✅ 免费额度充足（每月 $5）
- ✅ 中美用户都可访问（无需梯子）
- ✅ 自动同步 GitHub 仓库
- ✅ 支持 Next.js 和环境变量
- ✅ 中文界面友好

---

## 部署步骤

### 1. 注册 Zeabur 账号

访问：https://zeabur.com

- 点击右上角 "Sign Up"
- 使用 GitHub 账号登录（推荐）

### 2. 创建新项目

1. 登录后，点击 "Create Project"
2. 项目名称：`StockTracker`
3. 选择区域：**Hong Kong** 或 **Singapore**（国内访问最快）

### 3. 连接 GitHub 仓库

1. 在项目中点击 "Add Service"
2. 选择 "Git"
3. 选择你的 GitHub 仓库：`IcedOsmanthusLatte/StockTracker`
4. Zeabur 会自动检测到 Next.js 项目

### 4. 配置环境变量

在 Zeabur 项目设置中添加以下环境变量：

```
XAI_API_KEY=你的xAI_API密钥
HTTP_PROXY=（留空，Zeabur 不需要代理）
HTTPS_PROXY=（留空，Zeabur 不需要代理）
NEXT_PUBLIC_SUPABASE_URL=https://yrzfrgilxqfminhaltsv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mYyT4tBvI5X-kHnxSltAjQ_i0e8-fzc
```

**重要：** 删除或注释掉 `HTTP_PROXY` 和 `HTTPS_PROXY`，Zeabur 服务器可以直接访问 xAI API。

### 5. 部署

1. 环境变量配置完成后，点击 "Deploy"
2. Zeabur 会自动构建和部署
3. 部署完成后会生成一个域名，如：`stocktracker-xxx.zeabur.app`

### 6. 自动更新

以后每次推送代码到 GitHub，Zeabur 会自动：
1. 检测到更新
2. 重新构建
3. 自动部署新版本

---

## 其他平台选择

### Railway（备选）

**优点：**
- 免费额度（每月 $5）
- GitHub 自动部署
- 支持环境变量

**缺点：**
- 国内访问速度较慢

**部署地址：** https://railway.app

### Render（备选）

**优点：**
- 完全免费
- GitHub 自动部署

**缺点：**
- 国内访问不稳定
- 冷启动较慢

**部署地址：** https://render.com

---

## 注意事项

### 1. 代理配置

在 Zeabur/Railway 等平台部署时，**不需要配置代理**。服务器可以直接访问 xAI API。

建议修改 `lib/openai.ts`，根据环境自动判断是否使用代理：

```typescript
// 只在本地开发时使用代理
if (process.env.NODE_ENV === 'development' && (process.env.HTTP_PROXY || process.env.HTTPS_PROXY)) {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const agent = new HttpsProxyAgent(proxyUrl!);
  axiosConfig.httpsAgent = agent;
  axiosConfig.proxy = false;
}
```

### 2. 数据库连接

Supabase 是云服务，全球都可以访问，无需特殊配置。

### 3. 域名绑定（可选）

Zeabur 支持绑定自定义域名：
1. 在项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

---

## 成本估算

### Zeabur 免费额度
- 每月 $5 免费额度
- 足够小型项目使用
- 超出后按量计费

### 预计使用量
- Next.js 应用：~$2-3/月
- Supabase：免费（500MB 数据库）
- xAI API：按调用次数计费

**总计：** 在免费额度内

---

## 故障排查

### 部署失败
1. 检查环境变量是否正确配置
2. 查看构建日志
3. 确认 `package.json` 中的构建命令正确

### 无法访问
1. 检查域名是否正确
2. 等待 DNS 生效（最多 24 小时）
3. 尝试使用 Zeabur 提供的默认域名

### API 调用失败
1. 检查 xAI API Key 是否正确
2. 确认没有配置代理（服务器端不需要）
3. 查看服务器日志

---

## 推荐配置

为了最佳性能和访问速度：

1. **区域选择：** Hong Kong 或 Singapore
2. **环境变量：** 不配置代理
3. **数据库：** 使用 Supabase（已配置）
4. **CDN：** Zeabur 自带 CDN 加速

---

## 联系支持

- Zeabur 文档：https://zeabur.com/docs
- Zeabur Discord：https://discord.gg/zeabur
- GitHub Issues：https://github.com/zeabur/zeabur
