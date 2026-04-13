# 故障排除指南

## 常见问题和解决方案

### 1. Cannot find module 'react-native-worklets/plugin'

**问题**: 启动时出现找不到 worklets 插件的错误

**解决方案**:
```bash
npm install react-native-worklets-core
npx expo start --clear
```

### 2. 包版本不兼容警告

**问题**: 看到类似 "The following packages should be updated for best compatibility" 的警告

**解决方案**:
```bash
npx expo install --fix
```

这会自动将所有包更新到与当前 Expo SDK 版本兼容的版本。

### 3. Metro Bundler 缓存问题

**问题**: 代码更改后没有反映，或出现奇怪的错误

**解决方案**:
```bash
# 清除缓存重新启动
npx expo start --clear

# 或者完全清理
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

### 4. 二维码扫描失败

**问题**: 无法通过扫描二维码连接应用

**解决方案**:
1. 确保手机和电脑在同一 WiFi 网络
2. 检查防火墙设置
3. 尝试使用隧道模式：
   ```bash
   npx expo start --tunnel
   ```

### 5. TypeScript 类型错误

**问题**: IDE 显示类型错误但应用可以运行

**解决方案**:
```bash
# 重新生成类型定义
npx tsc --noEmit

# 如果仍有问题，重启 TypeScript 服务器
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### 6. iOS Simulator 无法打开

**问题**: 按 `i` 后 iOS Simulator 没有启动

**解决方案**:
```bash
# 手动打开 iOS Simulator
open -a Simulator

# 然后在 Expo 菜单中按 i
```

### 7. Android Emulator 连接问题

**问题**: Android 模拟器无法连接到开发服务器

**解决方案**:
```bash
# 确保 ADB 正常运行
adb devices

# 如果没有设备，启动模拟器后再试
# 在 Expo 菜单中按 a
```

### 8. NativeWind/Tailwind 样式不生效

**问题**: Tailwind 类名没有应用样式

**解决方案**:
1. 确认 `babel.config.js` 包含 `'nativewind/babel'`
2. 确认 `tailwind.config.js` 存在且配置正确
3. 确认导入了 `global.css`
4. 清除缓存重启：
   ```bash
   npx expo start --clear
   ```

### 9. Supabase 连接错误

**问题**: 无法连接到 Supabase

**解决方案**:
1. 检查 `constants/config.ts` 中的 URL 和 Key 是否正确
2. 确认网络连接正常
3. 查看浏览器控制台或终端的错误信息
4. 暂时使用示例数据（应用会自动降级）

### 10. 热重载不工作

**问题**: 保存文件后应用没有自动刷新

**解决方案**:
1. 摇动设备打开开发者菜单
2. 确保 "Fast Refresh" 已启用
3. 手动按 `r` 重新加载
4. 检查是否有语法错误阻止了重载

## 性能优化建议

### 1. 加快启动速度

```bash
# 使用本地 IP 而不是 tunnel
npx expo start

# 避免每次都清除缓存（除非必要）
npx expo start  # 而不是 npx expo start --clear
```

### 2. 减少包体积

```bash
# 检查包大小
npx react-native-bundle-visualizer

# 移除未使用的依赖
npm prune
```

### 3. 优化开发体验

```bash
# 安装 Expo Dev Client（用于测试原生模块）
npx expo install expo-dev-client

# 使用 Web 进行快速 UI 测试
npx expo start --web
```

## 调试技巧

### 1. 查看日志

```bash
# 终端会显示所有日志
# 也可以使用 React Native Debugger
```

### 2. 启用远程调试

1. 摇动设备打开开发者菜单
2. 选择 "Debug Remote JS"
3. 浏览器会打开 Chrome DevTools

### 3. 检查网络请求

- Web: 使用浏览器 DevTools Network 面板
- 移动端: 使用 React Native Debugger 或 Flipper

### 4. 性能监控

```javascript
// 在代码中添加性能标记
console.time('operation');
// ... 你的代码
console.timeEnd('operation');
```

## 常见错误消息

### "Unable to resolve module"

```bash
# 清除缓存并重新安装
rm -rf node_modules
npm install
npx expo start --clear
```

### "Module not found: Can't resolve"

检查导入路径是否正确，特别是使用 `@/` 别名时。

### "Invariant Violation"

通常是组件渲染错误，检查：
- 是否返回了有效的 JSX
- 是否有未定义的变量
- Hooks 是否在顶层调用

## 获取帮助

如果以上方法都无法解决问题：

1. **查看官方文档**
   - [Expo Docs](https://docs.expo.dev)
   - [React Native Docs](https://reactnative.dev)

2. **搜索错误信息**
   - GitHub Issues
   - Stack Overflow
   - Expo Forums

3. **提供详细信息**
   - Expo 版本
   - 操作系统
   - 完整的错误堆栈
   - 复现步骤

## 预防措施

1. **定期更新依赖**
   ```bash
   npx expo install --fix
   npm outdated
   ```

2. **使用版本控制**
   ```bash
   git add .
   git commit -m "working state"
   ```

3. **备份配置文件**
   - `app.json`
   - `package.json`
   - `babel.config.js`
   - `tsconfig.json`

4. **阅读更新日志**
   - 升级前查看 breaking changes
   - 遵循迁移指南

---

**记住**: 大多数问题都可以通过清除缓存和重新安装依赖来解决！

```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```
