# 快速启动指南

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Expo Go App（在手机上测试）
- iOS Simulator 或 Android Emulator（可选）

## 安装步骤

### 1. 克隆项目后安装依赖

```bash
cd ai-english-learner
npm install
```

### 2. 配置 Supabase（可选）

如果你想要完整功能，需要配置 Supabase：

1. 访问 [supabase.com](https://supabase.com) 创建账号
2. 创建新项目
3. 在项目设置中获取 URL 和 Anon Key
4. 编辑 `constants/config.ts`：

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

5. 在 Supabase SQL Editor 中执行 README.md 中的 SQL 脚本

**注意**: 如果不配置 Supabase，应用会使用示例数据正常运行。

### 3. 启动开发服务器

```bash
npm start
```

你会看到一个二维码和几个选项：

- 按 `i` - 在 iOS Simulator 中打开
- 按 `a` - 在 Android Emulator 中打开  
- 扫描二维码 - 在真机上通过 Expo Go 打开

### 4. 在设备上运行

#### 使用真机（推荐）

1. 在手机上安装 Expo Go：
   - iOS: App Store 搜索 "Expo Go"
   - Android: Play Store 搜索 "Expo Go"

2. 确保手机和电脑在同一 WiFi 网络

3. 扫描终端中的二维码

#### 使用模拟器

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

## 测试应用

### 测试流程

1. **注册账户**
   - 点击"立即注册"
   - 输入邮箱和密码（如果未配置 Supabase，会显示错误但可以使用示例数据）

2. **浏览文章**
   - 点击底部"文章"标签
   - 选择难度筛选
   - 点击任意文章开始阅读

3. **阅读文章**
   - 滚动阅读文章内容
   - 长按任意单词添加到生词本
   - 点击"标记为完成"

4. **查看生词本**
   - 点击底部"生词本"标签
   - 查看添加的单词
   - 标记为已掌握或删除

5. **查看统计**
   - 点击底部"统计"标签
   - 查看学习进度

## 常见问题

### 二维码扫描失败

确保：
- 手机和电脑在同一 WiFi 网络
- 防火墙没有阻止连接
- 尝试使用隧道模式：`npm start -- --tunnel`

### 编译错误

清除缓存后重试：
```bash
npx expo start -c
```

### TypeScript 错误

重新安装依赖：
```bash
rm -rf node_modules
npm install
```

### Metro Bundler 问题

重启 Metro：
```bash
npx expo start --clear
```

## 开发提示

### 热重载

Expo 支持快速刷新，保存文件后会自动重新加载。

### 调试

- 在 Expo Go 中摇动设备打开开发者菜单
- 使用 `console.log()` 输出日志
- 在浏览器中打开 DevTools（Web 模式）

### 添加新页面

在 `app/` 目录下创建新文件，Expo Router 会自动处理路由。

例如：
- `app/profile.tsx` → `/profile`
- `app/settings/index.tsx` → `/settings`

## 下一步

1. 配置 Supabase 以启用完整功能
2. 添加更多文章数据
3. 自定义主题颜色（在 `constants/colors.ts`）
4. 添加新功能

## 获取帮助

- 查看 [Expo 文档](https://docs.expo.dev)
- 查看 [React Native 文档](https://reactnative.dev)
- 提交 Issue

祝你开发愉快！🚀
