# TechCrunch AI News API 集成指南

## 📋 概述

已成功将 AI 新闻服务从网页抓取方式迁移到 TechCrunch AI News API，提供更稳定、更可靠的新闻数据源。

## ✅ 完成的更改

### 1. 配置文件更新
- **文件**: `constants/config.ts`
- **新增配置**:
  ```typescript
  export const TECHCRUNCH_AI_NEWS_API = {
    baseUrl: 'http://120.79.1.150:8000',
    apiKey: 'sk-default-key-for-testing',
    defaultMaxArticles: 10,
  };
  ```

### 2. 新闻服务重构
- **文件**: `services/ai-news-service.ts`
- **主要改进**:
  - ✅ 使用 REST API 替代网页抓取
  - ✅ 添加 5 分钟缓存机制
  - ✅ 简化代码逻辑（删除 150+ 行解析代码）
  - ✅ 更好的错误处理和降级策略
  - ✅ 支持自定义获取文章数量

### 3. API 端点
```bash
# 基础用法 - 获取最新 5 条新闻
GET http://120.79.1.150:8000/news?max_articles=5
Headers: X-API-Key: sk-default-key-for-testing

# 带摘要的新闻
GET http://120.79.1.150:8000/news?max_articles=2&include_summary=true
Headers: X-API-Key: sk-default-key-for-testing
```

### 4. 响应格式
```json
{
  "success": true,
  "total": 5,
  "articles": [
    {
      "title": "Article Title",
      "url": "https://techcrunch.com/...",
      "category": "AI",
      "date": "3 hours ago",
      "summary": "Article summary..."
    }
  ],
  "message": "Successfully retrieved 5 articles"
}
```

## 🚀 使用方法

### 在组件中使用

```typescript
import { aiNewsService } from '@/services/ai-news-service';

// 获取新闻（自动使用缓存）
const articles = await aiNewsService.fetchArticles(false, 10);

// 强制刷新（跳过缓存）
const freshArticles = await aiNewsService.fetchArticles(true, 10);

// 清除缓存
aiNewsService.clearCache();

// 获取缓存的文章
const cached = aiNewsService.getCachedArticles();
```

### 测试 API

```bash
# 运行测试脚本
npm run test:news-api

# 或直接使用 curl
curl "http://120.79.1.150:8000/news?max_articles=5" \
  -H "X-API-Key: sk-default-key-for-testing"
```

## 📊 性能对比

| 特性 | 旧方案（网页抓取） | 新方案（API） |
|------|------------------|--------------|
| 可靠性 | ⚠️ 依赖 CORS 代理 | ✅ 直接 API 调用 |
| 速度 | 🐌 需要多次请求 | ⚡ 单次请求 |
| 维护成本 | 🔧 高（需维护解析逻辑） | 🔧 低（标准 API） |
| 数据质量 | ⚠️ 不稳定 | ✅ 结构化数据 |
| 缓存 | ❌ 无 | ✅ 5分钟自动缓存 |
| 代码量 | ~350 行 | ~200 行 |

## 🔄 缓存策略

- **缓存时长**: 5 分钟
- **缓存键**: 内存缓存（cachedArticles）
- **自动过期**: 超过 5 分钟后自动重新获取
- **手动清除**: 调用 `clearCache()` 方法

## 🛠️ 配置选项

### 修改 API 地址
编辑 `constants/config.ts`:
```typescript
export const TECHCRUNCH_AI_NEWS_API = {
  baseUrl: 'YOUR_API_URL',
  apiKey: 'YOUR_API_KEY',
  defaultMaxArticles: 10,
};
```

### 调整缓存时间
编辑 `services/ai-news-service.ts`:
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 改为其他时长（毫秒）
```

### 默认文章数量
在调用时指定：
```typescript
const articles = await aiNewsService.fetchArticles(false, 20); // 获取 20 篇
```

## 🐛 故障排除

### 问题 1: API 请求失败
**症状**: 控制台显示 "Failed to fetch AI news articles from API"

**解决方案**:
1. 检查 API 服务器是否可访问：
   ```bash
   curl http://120.79.1.150:8000/news?max_articles=1
   ```
2. 验证 API Key 是否正确
3. 检查网络连接

### 问题 2: 返回空数组
**症状**: 成功请求但返回 0 篇文章

**解决方案**:
1. 检查 API 响应中的 `total` 字段
2. 确认 TechCrunch 有最新的 AI 新闻
3. 查看是否有降级示例数据

### 问题 3: 缓存不工作
**症状**: 每次都重新请求 API

**解决方案**:
1. 确认没有调用 `forceRefresh = true`
2. 检查 `lastFetchTime` 是否正常更新
3. 验证缓存时长配置

## 📝 迁移清单

- [x] 更新配置文件
- [x] 重构新闻服务
- [x] 删除旧的网页抓取代码
- [x] 添加缓存机制
- [x] 创建测试脚本
- [x] 更新文档
- [ ] 在生产环境测试
- [ ] 监控 API 使用情况
- [ ] 设置 API 密钥管理（如需要）

## 🔐 安全注意事项

当前使用的是测试 API Key (`sk-default-key-for-testing`)。

**生产环境建议**:
1. 使用环境变量存储 API Key
2. 不要将真实 API Key 提交到版本控制
3. 考虑实现 API Key 轮换机制
4. 添加请求速率限制

## 📈 监控和日志

服务包含详细的日志输出：
- ✅ 成功获取文章数量
- ✅ 缓存使用情况
- ❌ 错误详情
- ⚠️ 降级警告

查看浏览器控制台或应用日志了解详细信息。

## 🎯 下一步优化建议

1. **添加重试机制**: 网络失败时自动重试
2. **离线支持**: 保存最新文章到本地存储
3. **个性化推荐**: 根据用户兴趣过滤新闻
4. **多语言支持**: 翻译非英文新闻
5. **推送通知**: 重大 AI 新闻提醒

## 📞 支持

如有问题或建议，请：
1. 检查本文档的故障排除部分
2. 查看控制台日志
3. 联系 API 提供方

---

**最后更新**: 2026-04-13
**版本**: 1.0.0
