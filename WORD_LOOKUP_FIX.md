# 单词查找问题修复

## 问题描述

用户在文章中添加单词到生词本后，再次点击该单词查看詳情时，显示"单词不存在"。

## 根本原因

### 大小写不一致问题

1. **添加单词时**：
   - 用户点击的单词可能是 "Hello"、"HELLO" 或 "hello"
   - `toggleWordFavorite` 会将单词转换为小写后存入数据库
   - 数据库中存储：`"hello"`

2. **查询单词时**：
   - 从 URL 参数获取单词：`/word/Hello`
   - 直接使用原始值查询：`"Hello"`
   - 数据库中没有 `"Hello"`，只有 `"hello"`
   - 查询失败，返回"单词不存在"

### 代码问题点

**问题 1**: `app/article/[id].tsx` 第70行
```typescript
// ❌ 错误：直接比较，没有清理单词
const exists = vocabularies.some(v => v.word === selectedWord);
```

**问题 2**: `app/word/[word].tsx` 第14行
```typescript
// ❌ 错误：直接使用 URL 参数，没有清理
const { data: vocabulary, isLoading } = useVocabulary(word as string);
```

**问题 3**: `services/vocabulary-service.ts` 第105行
```typescript
// ❌ 错误：未找到记录时抛出异常
if (error) throw error;
```

## 修复方案

### 1. 统一使用 cleanWord 函数

在比较和查询单词时，都使用 `cleanWord()` 函数进行标准化处理：

```typescript
import { cleanWord } from '@/utils/format';

// cleanWord 会：
// 1. 移除非字母字符
// 2. 转换为小写
// "Hello!" → "hello"
// "WORLD" → "world"
```

### 2. 修复文章页面的收藏检查

**文件**: `app/article/[id].tsx`

```typescript
// ✅ 修复后
useEffect(() => {
  if (selectedWord && vocabularies.length > 0) {
    const cleanedWord = cleanWord(selectedWord);
    const exists = vocabularies.some(v => v.word === cleanedWord);
    setIsFavorite(exists);
  }
}, [selectedWord, vocabularies]);
```

### 3. 修复单词详情页的查询

**文件**: `app/word/[word].tsx`

```typescript
// ✅ 修复后
const { word } = useLocalSearchParams();
const cleanedWord = word ? cleanWord(word as string) : '';
const { data: vocabulary, isLoading } = useVocabulary(cleanedWord);
```

### 4. 优化服务层的错误处理

**文件**: `services/vocabulary-service.ts`

```typescript
// ✅ 修复后
async getVocabularyByWord(userId: string, word: string) {
  const { data, error } = await supabase
    .from('vocabularies')
    .select('*')
    .eq('user_id', userId)
    .eq('word', word.toLowerCase())
    .single();
  
  // PGRST116 表示没有找到记录，这是正常情况
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return data as Vocabulary | null;
}
```

## 数据流对比

### 修复前 ❌

```
用户点击 "Hello" 
  ↓
添加到数据库: word = "hello" ✓
  ↓
点击查看详情: /word/Hello
  ↓
查询: SELECT * WHERE word = 'Hello'
  ↓
结果: NULL (找不到) ❌
  ↓
显示: "单词不存在"
```

### 修复后 ✅

```
用户点击 "Hello"
  ↓
添加到数据库: word = "hello" ✓
  ↓
点击查看详情: /word/Hello
  ↓
清理单词: cleanWord("Hello") → "hello"
  ↓
查询: SELECT * WHERE word = 'hello'
  ↓
结果: { id: "...", word: "hello", ... } ✓
  ↓
显示: 单词详情页面
```

## 测试场景

| 输入单词 | 数据库存储 | 查询输入 | 清理后 | 能否找到 |
|---------|----------|---------|-------|---------|
| Hello | hello | Hello | hello | ✅ |
| HELLO | hello | HELLO | hello | ✅ |
| hello! | hello | hello! | hello | ✅ |
| World's | worlds | World's | worlds | ✅ |
| test-case | testcase | test-case | testcase | ✅ |

## 相关文件修改

- ✅ `app/article/[id].tsx` - 修复收藏检查逻辑
- ✅ `app/word/[word].tsx` - 添加单词清理
- ✅ `services/vocabulary-service.ts` - 优化错误处理

## 额外优化建议

1. **URL 编码优化**：确保单词在 URL 中正确编码
   ```typescript
   router.push(`/word/${encodeURIComponent(cleanWord(word))}`);
   ```

2. **缓存策略**：考虑增加缓存时间，减少重复查询
   ```typescript
   staleTime: 5 * 60 * 1000, // 5分钟
   ```

3. **错误提示优化**：区分"单词不存在于生词本"和"单词不存在于词典"

## 预防措施

为避免将来出现类似问题，建议：

1. **始终使用 cleanWord**：在任何涉及单词比较的地方都使用此函数
2. **数据库约束**：在数据库层面添加唯一约束 `(user_id, word)`
3. **单元测试**：为单词处理逻辑编写单元测试
4. **类型安全**：创建 WordString 类型，强制使用清理后的单词
