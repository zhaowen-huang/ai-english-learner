# AI 生成内容数据库缓存系统

## 📋 概述

本系统实现了完整的 AI 生成内容数据库缓存机制，所有通过 LLM（大语言模型）生成的内容都会先检查数据库中是否存在缓存，如果存在则直接使用，避免重复调用 API 产生费用。

## ✨ 核心功能

### 1. 自动缓存管理
- **首次查询**：调用阿里云 LLM API 生成内容并保存到数据库
- **后续查询**：直接从数据库读取缓存，无需调用 API
- **智能哈希**：使用输入内容的哈希值作为唯一标识

### 2. 支持的缓存类型

| 类型 | 常量 | 说明 | 示例 |
|------|------|------|------|
| 单词详情 | `WORD_DETAIL` | 不带上下文的单词解释 | "apple" 的解释 |
| 带上下文的单词详情 | `WORD_DETAIL_WITH_CONTEXT` | 根据句子上下文解释单词 | 在 "I ate an apple" 中 "apple" 的意思 |
| 文本翻译 | `TRANSLATE_TEXT` | 单句文本翻译 | "Hello world" → "你好世界" |
| 句子翻译 | `TRANSLATE_SENTENCES` | 多句批量翻译 | ["How are you?", "I'm fine."] |

### 3. 性能优化
- **减少 API 调用**：相同内容只调用一次 API
- **降低费用**：避免重复生成相同内容
- **提升响应速度**：数据库查询比 API 调用快得多
- **离线可用**：已缓存的内容在无网络时也能访问

## 🏗️ 架构设计

### 数据库表结构

```sql
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,           -- 内容类型
  content_hash TEXT NOT NULL,            -- 输入内容哈希
  input_data JSONB,                      -- 输入参数（JSON格式）
  output_data JSONB NOT NULL,            -- AI 生成结果（JSON格式）
  created_at TIMESTAMPTZ DEFAULT NOW(),  -- 创建时间
  updated_at TIMESTAMPTZ DEFAULT NOW(),  -- 更新时间
  
  CONSTRAINT unique_content_type_hash UNIQUE (content_type, content_hash)
);
```

### 索引优化

```sql
-- 加速按类型查询
CREATE INDEX idx_ai_cache_content_type ON ai_cache(content_type);

-- 加速按哈希查询
CREATE INDEX idx_ai_cache_content_hash ON ai_cache(content_hash);

-- 复合索引加速组合查询
CREATE INDEX idx_ai_cache_type_hash ON ai_cache(content_type, content_hash);
```

## 🔧 使用方法

### 1. 服务层集成

所有 LLM 调用都已自动集成缓存，无需额外代码：

```typescript
// ✅ 自动使用缓存 - 无需修改现有代码
const translation = await aliyunLLMService.translateText("Hello");
const wordDetail = await aliyunLLMService.getWordDetail("apple");
const translations = await aliyunLLMService.translateSentences(sentences);
```

### 2. 手动管理缓存

```typescript
import { aiCacheService, AIContentType } from '@/services/ai-cache-service';

// 检查缓存是否存在
const exists = await aiCacheService.existsInCache(
  AIContentType.WORD_DETAIL,
  'apple'
);

// 获取缓存数据
const cached = await aiCacheService.getFromCache(
  AIContentType.WORD_DETAIL,
  'apple'
);

// 保存数据到缓存
await aiCacheService.saveToCache(
  AIContentType.WORD_DETAIL,
  ['apple'],
  { word: 'apple', pronunciation: '/ˈæpl/', ... }
);

// 清除特定类型的缓存
await aiCacheService.clearCacheByType(AIContentType.WORD_DETAIL);

// 清除所有缓存
await aiCacheService.clearAllCache();

// 获取缓存统计信息
const stats = await aiCacheService.getCacheStats();
console.log(stats.total);      // 总缓存数量
console.log(stats.byType);     // 各类型数量
```

### 3. React Hooks 中使用

```typescript
import { useWordDefinition, useTranslateSentences } from '@/hooks';

// 自动使用缓存
const { data: wordDefinition } = useWordDefinition('apple');
const translateMutation = useTranslateSentences();
const { mutateAsync } = translateMutation;

// 调用时会自动检查缓存
await mutateAsync(['Hello', 'World']);
```

## 📱 用户界面

### AI 缓存管理页面

路径：`首页 → AI 缓存管理`

功能：
- 📊 查看总缓存数量和各类型分布
- 🗑️ 清除特定类型的缓存
- 🧹 一键清除所有缓存
- 💡 查看缓存使用说明

## 🔍 工作原理

### 缓存流程

```
用户请求
   ↓
生成输入内容的哈希值
   ↓
查询数据库是否有缓存？
   ├─ 是 → 返回缓存数据 ✅ (快速，无费用)
   └─ 否 → 调用 LLM API
              ↓
         保存结果到数据库
              ↓
         返回生成结果
```

### 哈希算法

使用简单的字符串哈希函数，将输入内容转换为唯一的哈希值：

```typescript
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
```

### 冲突处理

使用 `upsert` 操作避免重复插入：

```typescript
await supabase
  .from('ai_cache')
  .upsert(
    { content_type, content_hash, input_data, output_data },
    { onConflict: 'content_type,content_hash' }
  );
```

## 📊 监控和维护

### 查看缓存统计

```typescript
const stats = await aiCacheService.getCacheStats();
// 输出:
// {
//   total: 150,
//   byType: {
//     word_detail: 80,
//     word_detail_with_context: 40,
//     translate_text: 20,
//     translate_sentences: 10
//   }
// }
```

### 清理策略

建议定期清理过期或不常用的缓存：

```typescript
// 清除所有缓存（谨慎使用）
await aiCacheService.clearAllCache();

// 清除特定类型
await aiCacheService.clearCacheByType(AIContentType.TRANSLATE_TEXT);
```

## 🚀 部署步骤

### 1. 运行数据库迁移

```bash
# 在 Supabase Dashboard 中执行 SQL
# 文件位置: supabase/migrations/001_create_ai_cache.sql
```

### 2. 验证服务配置

确保以下文件正确配置：
- ✅ `services/ai-cache-service.ts` - 缓存服务
- ✅ `services/aliyun-llm-service.ts` - LLM 服务（已集成缓存）
- ✅ `services/supabase.ts` - Supabase 客户端（包含 ai_cache 类型定义）

### 3. 测试缓存功能

```bash
# 运行测试脚本
npx ts-node scripts/test-ai-cache.ts
```

### 4. 访问管理页面

在应用中导航到：`首页 → AI 缓存管理`

## 💰 成本节省估算

假设：
- 每次 LLM 调用平均费用：¥0.01
- 日均重复查询率：60%
- 日均查询次数：1000 次

**每月节省：**
```
1000 次/天 × 60% × ¥0.01 × 30 天 = ¥180/月
```

实际节省取决于用户的重复查询率，通常在 50%-80% 之间。

## ⚠️ 注意事项

1. **隐私保护**：缓存中包含用户查询内容，确保数据库访问权限设置正确
2. **存储空间**：定期清理过期缓存，避免占用过多存储空间
3. **数据一致性**：如果 LLM 模型更新，可能需要清除旧缓存以获取新结果
4. **错误处理**：缓存失败不会影响正常功能，只会降级为直接调用 API

## 🔮 未来优化

- [ ] 添加缓存过期时间（TTL）
- [ ] 实现LRU（最近最少使用）淘汰策略
- [ ] 添加缓存命中率监控和图表
- [ ] 支持批量导入/导出缓存数据
- [ ] 实现缓存预热机制

## 📞 技术支持

如有问题，请检查：
1. Supabase 连接是否正常
2. `ai_cache` 表是否已创建
3. RLS（行级安全）策略是否正确配置
4. 控制台日志中的 `[AI Cache]` 前缀消息

---

**最后更新**: 2026-04-08
**版本**: 1.0.0
