# PWA 部署到 Netlify 指南

## ✅ 已完成的配置

### 1. app.json
- ✅ 启用 PWA: `"pwa": true`
- ✅ 静态输出: `"output": "static"`

### 2. PWA Meta 标签
- ✅ 创建 `app/+html.tsx`
- ✅ 添加主题色、Apple 移动应用标签
- ✅ 添加 favicon 和 apple-touch-icon

### 3. Service Worker
- ✅ 创建 `public/service-worker.js`
- ✅ 实现离线缓存功能
- ✅ 使用 Stale-While-Revalidate 策略

### 4. Netlify 配置
- ✅ 创建 `netlify.toml`
- ✅ 配置构建命令和发布目录
- ✅ 配置 SPA 路由重定向
- ✅ 配置 Service Worker 不缓存

### 5. 修复 SSR 问题
- ✅ 修复 Supabase AsyncStorage 在 SSR 时的问题
- ✅ 添加 Web SSR 环境检测

## 🚀 部署步骤

### 方法 1：通过 Netlify CLI 部署（推荐）

#### 1. 安装 Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. 登录 Netlify
```bash
netlify login
```

#### 3. 初始化站点（首次部署）
```bash
netlify init
```
- 选择 "Create & configure a new site"
- 选择你的团队
- 输入站点名称（或使用随机名称）

#### 4. 部署
```bash
netlify deploy --prod
```

### 方法 2：通过 Git 自动部署

#### 1. 将代码推送到 GitHub/GitLab/Bitbucket
```bash
git add .
git commit -m "feat: add PWA support and Netlify deployment"
git push origin main
```

#### 2. 在 Netlify 网站上连接仓库
1. 访问 https://app.netlify.com
2. 点击 "Add new site" → "Import an existing project"
3. 选择你的 Git 提供商
4. 选择仓库
5. 构建设置会自动从 `netlify.toml` 读取
6. 点击 "Deploy site"

### 方法 3：手动拖拽部署

#### 1. 构建项目
```bash
npm run build:web
```

#### 2. 上传到 Netlify
1. 访问 https://app.netlify.com/drop
2. 将 `dist` 文件夹拖拽到上传区域

## 🔍 验证 PWA

### 1. 检查网站是否在线
访问你的 Netlify 站点 URL（例如：https://your-site-name.netlify.app）

### 2. 检查 Service Worker
1. 打开 Chrome DevTools (F12)
2. 切换到 **Application** 标签
3. 左侧菜单查看：
   - **Service Workers** - 应该显示已注册且状态为 "activated"
   - **Manifest** - 应该显示应用信息

### 3. 运行 Lighthouse 审计
1. 打开 Chrome DevTools
2. 切换到 **Lighthouse** 标签
3. 选择 categories：**Progressive Web App**
4. 点击 "Analyze page load"
5. 查看 PWA 得分（目标：90+）

### 4. 测试安装功能

#### Desktop (Chrome/Edge)
- 地址栏右侧应显示安装图标（💻）
- 点击即可安装为独立应用

#### iOS (Safari)
1. 点击分享按钮
2. 选择"添加到主屏幕"
3. 可以自定义名称后添加

#### Android (Chrome)
1. 点击菜单（⋮）
2. 选择"安装应用"或"添加到主屏幕"

## 📱 PWA 功能测试

### 1. 离线测试
1. 打开 DevTools → Network 标签
2. 将 throttle 改为 "Offline"
3. 刷新页面
4. 应该能看到缓存的页面

### 2. 后台同步测试
- 当前配置支持基本的离线访问
- 可以扩展添加 Background Sync API

### 3. 推送通知（可选）
- 当前未配置推送通知
- 可以通过 Web Push API 扩展

## ⚙️ 自定义配置

### 修改应用名称和图标
编辑 `app.json`：
```json
{
  "expo": {
    "name": "你的应用名称",
    "icon": "./assets/icon.png"
  }
}
```

### 修改主题色
编辑 `app/+html.tsx`：
```tsx
<meta name="theme-color" content="#你的颜色" />
```

### 修改缓存策略
编辑 `public/service-worker.js` 调整缓存行为

### 修改 Netlify 配置
编辑 `netlify.toml` 调整部署设置

## 🔧 常见问题

### Q: Service Worker 没有注册？
A: 
1. 检查浏览器控制台是否有错误
2. 确保通过 HTTPS 访问（Netlify 默认提供）
3. 检查 `/service-worker.js` 是否可以访问

### Q: 看不到安装提示？
A:
1. 确保满足 PWA 要求（manifest + service worker + HTTPS）
2. 运行 Lighthouse 审计查看具体问题
3. 某些浏览器需要用户与页面交互后才显示安装提示

### Q: iOS Safari 不显示安装选项？
A:
- iOS 需要手动"添加到主屏幕"
- 确保使用了正确的 meta 标签
- 检查 manifest.json 是否正确生成

### Q: 构建失败？
A:
1. 检查是否有 TypeScript 错误
2. 确保所有依赖已安装：`npm install`
3. 清理缓存后重新构建：`rm -rf dist && npm run build:web`

### Q: 路由刷新后 404？
A:
- `netlify.toml` 已配置 SPA 路由重定向
- 确保配置文件正确部署

## 📊 性能优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 使用懒加载

2. **代码分割**
   - Expo Router 已自动配置
   - 按需加载组件

3. **缓存策略**
   - Service Worker 已配置
   - 可以考虑使用 Workbox 优化

4. **CDN**
   - Netlify 自带全球 CDN
   - 自动压缩资源

## 🎯 下一步

1. ✅ 部署到 Netlify
2. ✅ 验证 PWA 功能
3. 🔄 添加推送通知（可选）
4. 🔄 添加后台同步（可选）
5. 🔄 优化性能和 Lighthouse 得分

## 📝 更新部署

每次代码更新后：

```bash
# 通过 CLI
netlify deploy --prod

# 或通过 Git
git push origin main
```

Netlify 会自动重新构建和部署！
