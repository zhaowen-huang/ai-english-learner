# AI 缓存系统 - 部署指南（最简单方法）

## 🎯 推荐方法：Supabase Dashboard（2分钟完成）

这是最简单、最可靠的方法，无需安装任何工具。

---

## 📋 步骤 1: 打开 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录你的账号
3. 选择你的项目 `ai-english-learner`

---

## 📋 步骤 2: 进入 SQL Editor

在左侧菜单栏中：
1. 点击 **SQL Editor** (图标是 📝)
2. 点击右上角的 **+ New query** 按钮

---

## 📋 步骤 3: 执行建表 SQL

### 复制以下完整 SQL：

```sql
-- ============================================
-- AI 生成内容缓存表
-- ============================================

-- 创建表
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
COMMENT ON TABLE ai_cache IS 'AI 生成内容缓存表，用于存储所有 AI 生成的内容以避免重复调用';
COMMENT ON COLUMN ai_cache.content_type IS '内容类型：word_detail(单词详情), word_detail_with_context(带上下文的单词详情), translate_text(文本翻译), translate_sentences(句子翻译)';
COMMENT ON COLUMN ai_cache.content_hash IS '输入内容的哈希值，用于快速匹配';
COMMENT ON COLUMN ai_cache.input_data IS '存储输入参数，便于调试和重新生成';
COMMENT ON COLUMN ai_cache.output_data IS 'AI 生成的结果数据';
```

### 执行 SQL：

1. 将上面的 SQL 粘贴到 SQL Editor 中
2. 点击右下角的 **Run** 按钮（或按 `Cmd + Enter` / `Ctrl + Enter`）
3. 等待执行完成

### 预期结果：

你应该看到绿色的成功提示：
```
✅ Success. No rows returned
```

如果看到错误，请检查：
- SQL 是否完整复制
- 是否有语法错误
- 数据库连接是否正常

---

## 📋 步骤 4: 配置 RLS 策略（重要！）

继续在同一个 SQL Editor 中，执行以下 SQL：

```sql
-- ============================================
-- 配置行级安全策略 (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（缓存数据不包含敏感信息）
CREATE POLICY "Allow public read access" ON ai_cache
  FOR SELECT
  USING (true);

-- 允许认证用户插入
CREATE POLICY "Allow authenticated users to insert" ON ai_cache
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 允许认证用户更新
CREATE POLICY "Allow authenticated users to update" ON ai_cache
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 禁止删除（只能通过管理界面删除）
CREATE POLICY "Deny delete for everyone" ON ai_cache
  FOR DELETE
  USING (false);
```

同样点击 **Run** 按钮执行。

### 预期结果：

```
✅ Success. No rows returned
```

---

## 📋 步骤 5: 验证安装

### 方法 1: 在 Supabase Dashboard 中查看

1. 在左侧菜单点击 **Table Editor** (图标是 📊)
2. 查找 `ai_cache` 表
3. 如果能看到这个表，说明创建成功！

### 方法 2: 运行测试脚本

在项目根目录执行：

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

✅ Cache system is working correctly!
```

---

## 📋 步骤 6: 启动应用

```bash
npx expo start
```

在应用中导航到：**首页 → AI 缓存管理** (💾)

你应该能看到缓存管理界面，显示当前缓存统计信息。

---

## ✅ 验证清单

完成以下检查确保一切正常：

- [ ] `ai_cache` 表已在 Supabase 中创建
- [ ] 三个索引已成功创建
- [ ] RLS 策略已配置（4个策略）
- [ ] 测试脚本运行成功（可选）
- [ ] 应用可以正常启动
- [ ] AI 缓存管理页面可以访问并显示统计信息

---

## 🔍 常见问题

### Q1: 提示 "relation 'ai_cache' does not exist"

**原因**: SQL 未执行或执行失败

**解决方案**:
1. 回到 SQL Editor
2. 重新执行步骤 3 的建表 SQL
3. 确认看到 "Success" 提示

### Q2: 提示 "permission denied for table ai_cache"

**原因**: RLS 策略未正确配置

**解决方案**:
1. 回到 SQL Editor
2. 重新执行步骤 4 的 RLS 策略 SQL
3. 确认所有 4 个策略都已创建

### Q3: 如何确认表已创建？

**方法 1**: 在 Supabase Dashboard 的 Table Editor 中查看

**方法 2**: 在 SQL Editor 中执行：
```sql
SELECT * FROM ai_cache LIMIT 1;
```

如果返回空结果或列信息，说明表存在。

### Q4: 缓存没有生效？

**检查项**:
1. 查看控制台日志，应该有 `[AI Cache] ✅ Cache hit` 消息
2. 确认 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 配置正确
3. 检查网络连接

### Q5: 如何清除所有缓存？

**方法 1**: 在应用的 "AI 缓存管理" 页面点击 "清除所有缓存"

**方法 2**: 在 Supabase SQL Editor 中执行：
```sql
DELETE FROM ai_cache;
```

---

## 💡 小贴士

1. **首次使用需要联网**：第一次查询某个内容时会调用 API 并缓存
2. **二次查询超快**：相同内容的第二次查询会直接从数据库读取，速度提升 10-100 倍
3. **定期清理**：建议每月清理一次过期缓存，节省存储空间
4. **监控效果**：观察控制台日志中的 `[AI Cache]` 消息，了解缓存命中率

---

## 📊 预期效果

假设日均查询 1000 次，重复查询率 60%：

| 指标 | 无缓存 | 有缓存 | 提升 |
|------|--------|--------|------|
| 响应速度 | 500-2000ms | 50-100ms | 10-40x |
| API 调用 | 1000 次/天 | 400 次/天 | 减少 60% |
| 月度费用 | ¥300 | ¥120 | 节省 ¥180 |

---

## 🎉 完成！

现在你已经成功部署了 AI 缓存系统！

- ✅ 所有 LLM 调用自动使用缓存
- ✅ 显著降低 API 费用
- ✅ 大幅提升响应速度
- ✅ 提供管理界面监控缓存

开始使用应用，享受更快的查询速度和更低的成本吧！🚀

---

**需要更多帮助？** 
- 查看完整文档：[AI_CACHE_SYSTEM.md](./AI_CACHE_SYSTEM.md)
- 查看实现总结：[AI_CACHE_IMPLEMENTATION_SUMMARY.md](./AI_CACHE_IMPLEMENTATION_SUMMARY.md)
