# AI 缓存系统 - 快速启动指南

## 🚀 5分钟快速部署

### 方法 1: 使用 Supabase Dashboard（推荐）

这是最简单、最可靠的方法：

#### 步骤 1: 打开 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录你的账号
3. 选择你的项目

#### 步骤 2: 进入 SQL Editor

1. 在左侧菜单点击 **SQL Editor**
2. 点击 **New query** 按钮

#### 步骤 3: 执行迁移 SQL

复制以下 SQL 并粘贴到编辑器中：

```sql
-- AI 生成内容缓存表
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'word_detail',
    'word_detail_with_context',
    'translate_text',
    'translate_sentences'
  )),
  content_hash TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_content_type_hash UNIQUE (content_type, content_hash)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_type ON ai_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_hash ON ai_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type_hash ON ai_cache(content_type, content_hash);

-- 添加注释
COMMENT ON TABLE ai_cache IS 'AI 生成内容缓存表';
COMMENT ON COLUMN ai_cache.content_type IS '内容类型';
COMMENT ON COLUMN ai_cache.content_hash IS '输入内容的哈希值';
COMMENT ON COLUMN ai_cache.input_data IS '存储输入参数';
COMMENT ON COLUMN ai_cache.output_data IS 'AI 生成的结果数据';
```

### 步骤 2: 配置 RLS（行级安全）策略

由于 AI 缓存是全局共享的（所有用户都可以读取），建议设置以下策略：

```sql
-- 启用 RLS
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（缓存数据不包含敏感信息）
CREATE POLICY "Allow public read access" ON ai_cache
  FOR SELECT
  USING (true);

-- 允许认证用户插入和更新
CREATE POLICY "Allow authenticated users to insert" ON ai_cache
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON ai_cache
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 禁止删除（或通过管理界面删除）
CREATE POLICY "Deny delete for everyone" ON ai_cache
  FOR DELETE
  USING (false);
```

### 步骤 3: 验证安装

运行测试脚本验证缓存系统是否正常工作：

```bash
cd /Users/oldwhite2333/Documents/ai-english-learner
npx ts-node scripts/test-ai-cache.ts
```

预期输出：
```
🧪 Testing AI Cache System...

📊 Step 1: Get cache statistics
   Total cached items: 0
   By type: {}

📝 Step 2: Test word detail cache
   Querying "apple" for the first time...
   Exists in cache: false

✅ Cache system is working correctly!
```

### 步骤 4: 启动应用

```bash
npx expo start
```

在应用中导航到：**首页 → AI 缓存管理**

你应该能看到缓存管理界面。

## ✅ 验证清单

- [ ] `ai_cache` 表已在 Supabase 中创建
- [ ] 索引已成功创建
- [ ] RLS 策略已配置
- [ ] 测试脚本运行成功
- [ ] 应用可以正常启动
- [ ] AI 缓存管理页面可以访问

## 🔍 常见问题

### Q1: 提示 "relation 'ai_cache' does not exist"

**解决方案**: 确保已在 Supabase 中执行了 SQL 迁移脚本。

### Q2: 缓存没有生效

**检查项**:
1. 查看控制台日志，应该有 `[AI Cache] ✅ Cache hit` 或 `[AI Cache] ✅ Saved to cache` 消息
2. 确认 Supabase URL 和 Key 配置正确
3. 检查网络连接

### Q3: 如何清除所有缓存？

**方法 1**: 在应用中访问 "AI 缓存管理" 页面，点击 "清除所有缓存"

**方法 2**: 在 Supabase SQL Editor 中执行：
```sql
DELETE FROM ai_cache;
```

### Q4: 缓存会占用多少空间？

根据经验估算：
- 每个单词详情约 500 bytes
- 每次翻译约 200 bytes
- 1000 条缓存记录约 0.5 MB

Supabase 免费套餐提供 500 MB 数据库空间，足够存储大量缓存。

## 📈 监控缓存效果

### 查看缓存命中率

在控制台中观察日志：
```
[AI Cache] ✅ Cache hit for word_detail          ← 命中缓存
[LLM] 🔄 Cache miss, calling API for getWordDetail  ← 未命中，调用 API
```

### 查看缓存统计

在 "AI 缓存管理" 页面可以看到：
- 总缓存数量
- 各类型缓存分布
- 实时刷新统计数据

## 🎯 下一步

1. **正常使用应用**：查询单词、翻译句子时会自动使用缓存
2. **观察节省效果**：随着使用增加，缓存命中率会提高
3. **定期维护**：每月清理一次过期缓存

---

**需要帮助？** 查看完整文档：`AI_CACHE_SYSTEM.md`
