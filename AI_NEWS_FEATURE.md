# AI News 爬虫功能说明

## 功能概述

已成功集成 artificialintelligence-news.com 的 RSS 爬虫功能，可以抓取最新的 AI 相关新闻文章。

## 主要特性

### ✅ 已完成的功能

1. **RSS 爬虫服务** (`services/ai-news-service.ts`)
   - 从 artificialintelligence-news.com 抓取 RSS feed
   - 备选数据源：TechCrunch AI 分类
   - 自动缓存机制，避免重复请求
   - 3秒超时控制，快速失败
   - HTML 标签清理和文本处理
   - 自动提取文章图片

2. **应用内阅读** 
   - 点击文章后在应用内打开详情页
   - 支持单词点击查询
   - 支持整句翻译
   - 支持难词识别
   - 支持添加到生词本

3. **UI 界面** (`app/(tabs)/ai-news.tsx`)
   - 卡片式文章列表展示
   - 分类筛选功能（AI Technology、AI Research、NLP 等）
   - 支持文章图片显示
   - 下拉刷新功能
   - 美观的响应式设计

4. **底部导航集成**
   - 新增"AI新闻"标签页（🤖 图标）

## 使用方法

1. 启动应用后，点击底部导航栏的"AI新闻"标签
2. 浏览最新的 AI 相关新闻
3. 使用顶部分类筛选器按主题筛选文章
4. 点击任意文章卡片，在应用内阅读全文
5. 在阅读页面可以：
   - 点击单词查看释义
   - 点击"翻译全文"按钮翻译文章
   - 点击"识别难词"标记难点词汇
   - 将生词添加到生词本

## 技术实现

### 数据流

```
RSS Feed → aiNewsService → useAINewsArticles Hook → AI News Page → Article Detail Page
```

### 关键文件

- `services/ai-news-service.ts` - AI News 爬虫服务
- `hooks/use-articles.ts` - React Query hooks（包含 useAINewsArticles）
- `app/(tabs)/ai-news.tsx` - AI News 列表页面
- `app/article/[id].tsx` - 文章详情页（已修改支持 AI News）
- `app/(tabs)/_layout.tsx` - 底部导航配置

### 数据存储

- AI News 文章临时存储在 AsyncStorage 中
- Key 格式：`ai-news-{articleId}`
- 用于在列表页和详情页之间传递完整文章数据

## 注意事项

1. **网络依赖**：首次加载需要网络连接获取 RSS feed
2. **缓存策略**：使用 TanStack Query 缓存，减少重复请求
3. **超时控制**：每个 RSS 源最多等待 3 秒
4. **降级方案**：所有 RSS 源失败时显示示例数据

## 扩展建议

如果需要进一步优化，可以考虑：

1. 添加离线缓存持久化
2. 实现文章收藏功能
3. 添加搜索功能
4. 支持更多 AI 新闻源
5. 实现文章推荐算法
