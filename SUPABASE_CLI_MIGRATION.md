# 使用 Supabase CLI 执行数据库迁移

## 🎯 前提条件

- ✅ Supabase CLI 已安装（版本 2.84.2）
- ✅ 已运行 `supabase init`

---

## 📋 步骤 1: 获取 Project ID

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **General**
4. 找到 **Project ID**（格式类似：`xxxxxxxxxxxxxx`）
5. 复制这个 ID

---

## 📋 步骤 2: 链接到远程项目

在项目根目录执行：

```bash
cd /Users/oldwhite2333/Documents/ai-english-learner

# 替换 YOUR_PROJECT_ID 为你的实际 Project ID
supabase link --project-ref YOUR_PROJECT_ID
```

例如：
```bash
supabase link --project-ref abcdefghijklmn
```

你会看到：
```
Finished supabase link.
```

---

## 📋 步骤 3: 检查迁移状态

```bash
# 查看待执行的迁移
supabase db remote commit
```

这会将本地迁移文件的状态同步到远程数据库。

---

## 📋 步骤 4: 执行迁移

```bash
# 推送所有待执行的迁移到远程数据库
supabase db push
```

你会看到类似这样的输出：
```
Applying migration 001_create_ai_cache.sql...
Applying migration 004_add_vocabulary_context_fields.sql...
Finished supabase db push.
```

---

## 📋 步骤 5: 验证迁移

### 方法 1: 使用 CLI 检查

```bash
# 列出所有表
supabase db diff --use-migra
```

### 方法 2: 在 Dashboard 中查看

1. 打开 Supabase Dashboard
2. 进入 **Table Editor**
3. 查找 `ai_cache` 表
4. 如果能看到，说明迁移成功！

### 方法 3: 运行测试脚本

```bash
npx ts-node scripts/test-ai-cache.ts
```

---

## 🚀 一键执行（推荐）

我已经创建了一个自动化脚本，可以帮你完成所有步骤：

```bash
./scripts/link-and-migrate.sh
```

这个脚本会：
1. 提示你输入 Project ID
2. 自动链接到远程项目
3. 执行所有迁移
4. 验证结果

---

## 🔍 常见问题

### Q1: 提示 "Authentication failed"

**原因**: 未登录或 token 过期

**解决方案**:
```bash
# 重新登录
supabase login
```

这会打开浏览器让你登录 Supabase 账号。

### Q2: 提示 "Project not found"

**原因**: Project ID 错误或项目不存在

**解决方案**:
1. 确认 Project ID 正确（从 Dashboard 复制）
2. 确认你有该项目的访问权限

### Q3: 迁移执行失败

**原因**: SQL 语法错误或表已存在

**解决方案**:
```bash
# 查看详细错误信息
supabase db push --debug

# 如果表已存在，可以跳过
# 或在 SQL 中使用 IF NOT EXISTS
```

### Q4: 如何查看已执行的迁移？

```bash
# 查看迁移历史
supabase db remote list
```

---

## 💡 小贴士

1. **首次链接需要登录**: 如果还没登录，先执行 `supabase login`
2. **迁移是幂等的**: 重复执行不会有问题，SQL 中使用了 `IF NOT EXISTS`
3. **查看迁移状态**: 随时可以用 `supabase db remote list` 查看
4. **回滚迁移**: 如果需要回滚，使用 `supabase db reset`（谨慎使用！）

---

## 📊 迁移文件说明

当前项目有以下迁移文件：

- `001_create_ai_cache.sql` - 创建 AI 缓存表
- `004_add_vocabulary_context_fields.sql` - 添加生词本上下文字段

执行 `supabase db push` 会自动按顺序执行所有未应用的迁移。

---

## ✅ 完成检查清单

- [ ] Supabase CLI 已安装
- [ ] 已获取 Project ID
- [ ] 已执行 `supabase link --project-ref YOUR_ID`
- [ ] 已执行 `supabase db push`
- [ ] `ai_cache` 表在 Dashboard 中可见
- [ ] 测试脚本运行成功
- [ ] 应用可以正常使用

---

## 🎉 完成！

迁移完成后，AI 缓存系统就可以正常使用了！

下一步：
1. 启动应用：`npx expo start`
2. 导航到：首页 → AI 缓存管理
3. 开始使用，享受更快的查询速度！🚀
