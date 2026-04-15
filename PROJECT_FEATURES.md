# AI English Learner - 项目完整功能文档

> **版本**: v1.0.0  
> **技术栈**: React Native (Expo) + TypeScript + Supabase + TanStack Query  
> **部署平台**: Netlify (Web PWA)  
> **最后更新**: 2026-04-13

---

## 📋 目录

- [项目概述](#项目概述)
- [核心功能模块](#核心功能模块)
- [技术架构](#技术架构)
- [数据库设计](#数据库设计)
- [API 集成](#api-集成)
- [UI/UX 设计规范](#uiux-设计规范)
- [开发规范](#开发规范)
- [部署配置](#部署配置)

---

## 项目概述

### 项目定位
AI English Learner 是一款面向英语学习者的新闻阅读应用，通过 AI 技术提供智能化的学习体验。用户可以在阅读真实英文新闻的过程中，即时查询单词、获取智能解释、添加生词本，并通过 AI 生成的语音进行听力训练。

### 核心价值主张
1. **沉浸式学习**：在真实语境中学习单词
2. **AI 辅助**：智能单词解释、例句生成、记忆技巧、全文翻译
3. **个性化**：基于用户学习进度的生词管理
4. **多模态**：文本阅读 + AI 语音朗读 + 图片辅助记忆

### 目标用户
- 中高级英语学习者（CET-4/6、雅思、托福备考者）
- 希望通过阅读提升英语能力的职场人士
- 需要积累专业词汇的学生和研究人员

---

## 🔄 核心交互流程总览

### 用户典型使用路径

```
新用户首次使用:
    ↓
打开应用 → 浏览文章列表（无需登录）
    ↓
点击文章 → 阅读英文内容
    ↓
遇到生词 → 点击单词查看解释
    ↓
感兴趣 → 添加到生词本（提示登录）
    ↓
注册/登录 → 成功添加
    ↓
继续浏览 → 重复上述流程
    ↓
进入生词本 → 复习已收藏单词
    ↓
批量管理 → 删除已掌握单词
```

### 关键交互节点

#### 1️⃣ 文章阅读流程
```
文章列表 → 点击卡片 → 文章详情 → 点击单词 → 弹窗解释 → 添加生词本
                                         ↓
                                    显示译文（可选）
                                         ↓
                                    朗读全文（可选）
```

#### 2️⃣ 生词管理流程
```
生词本列表 → 点击卡片 → 单词详情 → 发音/复习
       ↓
   选择模式 → 勾选多个 → 批量删除
```

#### 3️⃣ 认证流程
```
未登录状态 → 尝试添加生词 → 提示登录 → 注册/登录 → 自动返回
```

---

---

## 核心功能模块

### 📱 应用架构概览

**底部 Tab 导航**:
```
┌──────────────────────────────────────┐
│                                      │
│         [页面内容区域]                 │
│                                      │
├──────────────────────────────────────┤
│  📖 看新闻   📚 生词本   ⚡ 背单词    │ ← Tab 栏
└──────────────────────────────────────┘
```

**主要页面路由**:

| 路由 | 页面 | 需要登录 | 说明 |
|------|------|---------|------|
| `/` | 首页（重定向到 /articles） | ❌ | 默认入口 |
| `/articles` | 文章列表 | ❌ | 浏览新闻 |
| `/article/[id]` | 文章详情 | ❌ | 阅读+查词+翻译 |
| `/vocabulary` | 生词本列表 | ✅ | 管理收藏单词 |
| `/vocabulary/[id]` | 单词详情 | ✅ | 查看完整信息 |
| `/review` | 复习模式 | ✅ | SRS 算法（待实现） |
| `/stats` | 学习统计 | ✅ | 数据可视化 |
| `/auth/login` | 登录页 | ❌ | 用户登录 |
| `/auth/register` | 注册页 | ❌ | 新用户注册 |
| `/ai-cache-manager` | 缓存管理 | ❌ | 开发者工具 |

---

### 1️⃣ 新闻阅读模块 (Articles)

#### 功能描述
展示来自多个新闻源的英文文章，支持分类浏览、搜索和离线缓存。

#### 数据源
- **TechCrunch AI News API**（主数据源）
  - 地址: `http://120.79.1.150:8000`
  - 接口: `/news/list`, `/news/read`
  - 特点: 科技类新闻，实时抓取
  

#### 核心特性
- ✅ 文章列表分页加载
- ✅ 按分类筛选（Technology, Business, Science 等）
- ✅ 本地 AsyncStorage 缓存（离线可读）
- ✅ 发布时间相对化显示（"2 hours ago"）

#### 文件位置
```
app/(tabs)/articles.tsx          # 文章列表页
app/article/[id].tsx             # 文章详情页
services/news-api-service.ts     # NewsAPI 服务
hooks/use-articles.ts            # 文章 Hooks
```

---

### 2️⃣ 文章详情与交互模块

#### 功能清单

##### A. 基础阅读体验
- **排版优化**
  - 字体: Georgia (iOS) / serif (Android)
  - 字号: 标题 48px，正文 30px
  - 行高: 1.47 (44px/30px)
  - 段落间距: 32px
  - 颜色: 深灰 (#3C3C3C) 确保可读性

- **元信息展示**
  - 分类标签（带边框徽章样式）
  - 发布日期（格式化显示）
  - 阅读时长估算（基于字数计算）
  - 装饰性分隔线（菱形图案）

##### B. 单词点击查询（核心功能）

**触发条件**:
- 用户点击文章中任意英文单词
- 单词长度 ≥ 2 个字母（过滤单字符和标点）
- 仅英文单词可点击（正则: `/^[a-zA-Z]+$/`）

**完整交互流程**:

```
用户点击单词 "sophisticated"
    ↓
1️⃣ 【前端处理】提取并清理单词
   - 调用 cleanWord("sophisticated") 
   - 去除前后空格、标点
   - 转为小写: "sophisticated"
    ↓
2️⃣ 【上下文提取】获取所在段落
   - 调用 extractContextSentence(paragraph, "sophisticated")
   - 提取包含该单词的完整句子
   - 示例: "The sophisticated algorithm..."
    ↓
3️⃣ 【状态更新】设置弹窗状态
   - setSelectedWord("sophisticated")
   - setContextSentence("The sophisticated algorithm...")
   - setShowWordPopup(true)
   - setIsFavorite(false) // 重置收藏状态
    ↓
4️⃣ 【API 请求】TanStack Query 自动触发
   - useWordDetailWithContext("sophisticated", context)
   - queryKey: ['word-detail-context', 'sophisticated', context]
   - 检查缓存 → 有则直接返回，无则请求 API
    ↓
5️⃣ 【阿里云 LLM】调用 API（如缓存未命中）
   POST /chat/completions
   Body: {
     model: "qwen-plus",
     messages: [
       { role: "system", content: "You are an English teacher..." },
       { role: "user", content: "Explain 'sophisticated' in context: ..." }
     ]
   }
    ↓
6️⃣ 【响应解析】获取 AI 生成的内容
   {
     simpleExplanation: "complex and advanced",
     exampleSentences: ["...", "..."],
     funMemory: "sophisti-cated → 复杂的猫"
   }
    ↓
7️⃣ 【收藏状态检查】对比生词本
   - useEffect 监听 selectedWord 变化
   - 遍历 vocabularies 数组
   - 检查是否存在相同单词
   - 设置 isFavorite = true/false
    ↓
8️⃣ 【UI 渲染】显示弹窗 Modal
   ┌─────────────────────────┐
   │  sophisticated           │ ← 大字加粗居中
   │                          │
   │  Context                 │ ← 上下文区域
   │  The 👉 sophisticated 👈 │    (高亮目标词)
   │  algorithm processes...  │
   │                          │
   │  Explanation             │ ← 英文解释
   │  complex and advanced    │
   │                          │
   │  Examples                │ ← 例句列表
   │  • This is a ...         │
   │  • She has a ...         │
   │                          │
   │  🎯 sophisti-cated       │ ← 记忆技巧
   │     → 复杂的猫            │
   │                          │
   │  [📝 添加到生词本] [关闭] │ ← 操作按钮
   └─────────────────────────┘
    ↓
9️⃣ 【用户操作分支】
   ├─ 点击 "添加到生词本"
   │    ↓
   │    检查是否登录 → 未登录则 Alert 提示
   │    ↓
   │    调用 toggleFavoriteMutation.mutateAsync()
   │    ↓
   │    乐观更新 UI（立即显示 "✓ 已添加"）
   │    ↓
   │    后端插入数据库
   │    ↓
   │    成功 → Alert.alert('✅ 成功', '已添加...')
   │    失败 → Alert.alert('❌ 失败', '添加失败')
   │    ↓
   │    重新拉取 vocabularies 列表
   │    ↓
   │    更新 isFavorite = true
   │
   └─ 点击 "关闭" 或遮罩层
        ↓
        setShowWordPopup(false)
        ↓
        清空 selectedWord、contextSentence
```

**技术实现细节**:

```typescript
// 1. 单词分割与渲染
const tokens = paragraph.match(/[a-zA-Z]+|[^a-zA-Z]+/g) || [];

tokens.map((token, tIndex) => {
  if (/^[a-zA-Z]+$/.test(token) && token.length >= 2) {
    return (
      <TouchableOpacity
        key={tIndex}
        activeOpacity={0.5}  // 点击反馈
        onPress={() => handleWordPress(token, paragraph)}
        style={styles.wordTouchable}
      >
        <Text style={styles.paragraphWord}>{token}</Text>
      </TouchableOpacity>
    );
  }
  // 标点符号不可点击
  return <Text key={tIndex}>{token}</Text>;
});

// 2. 单词点击处理
const handleWordPress = (word: string, paragraph: string) => {
  const cleaned = cleanWord(word);  // 清理单词
  if (cleaned.length >= 2) {
    const sentence = extractContextSentence(paragraph, cleaned);
    setSelectedWord(cleaned);
    setContextSentence(sentence);
    setIsFavorite(false);
    setShowWordPopup(true);
  }
};

// 3. TanStack Query Hook
const { data: wordDetail, isLoading, error, refetch } = useWordDetailWithContext(
  selectedWord,
  contextSentence || null
);

// 4. 收藏状态检查
useEffect(() => {
  if (selectedWord && vocabularies.length > 0) {
    const cleanedWord = cleanWord(selectedWord);
    const exists = vocabularies.some(v => v.word === cleanedWord);
    setIsFavorite(exists);
  }
}, [selectedWord, vocabularies]);

// 5. 添加到生词本
const handleAddToFavorites = async () => {
  if (!user || !selectedWord || !wordDetail) {
    Alert.alert('提示', '请先登录');
    return;
  }

  setAddingFavorite(true);
  try {
    await toggleFavoriteMutation.mutateAsync({
      word: selectedWord.toLowerCase(),
      meaning: wordDetail.simpleExplanation,
      example: wordDetail.exampleSentences?.[0],
      contextSentence: contextSentence,
      articleUrl: article?.sourceUrl,
    });
    
    setIsFavorite(true);
    Alert.alert('✅ 成功', `已添加 "${selectedWord}" 到生词本`);
  } catch (error) {
    Alert.alert('❌ 失败', '添加到生词本失败');
  } finally {
    setAddingFavorite(false);
  }
};
```

**性能优化策略**:

1. **智能缓存**
   - staleTime: 24 小时（单词解释很少变化）
   - gcTime: 7 天（长期保留）
   - 相同单词 + 相同上下文 = 相同缓存键

2. **后台刷新**
   - 用户再次查看同一单词时，先显示缓存
   - 后台静默检查是否有更新
   - 无感知更新，不影响用户体验

3. **错误重试**
   - retry: 1（失败自动重试一次）
   - onError 回调记录日志
   - UI 显示 "加载失败" + "重试" 按钮

4. **防止重复请求**
   - TanStack Query 自动去重
   - 多个组件使用相同 queryKey 时只请求一次
   - 组件卸载后自动取消 pending 请求

**边界情况处理**:

| 场景 | 处理方式 |
|------|---------|
| 单词长度 < 2 | 不触发查询（过滤掉 "a", "I" 等） |
| 非英文字符 | 不渲染为可点击（标点、数字） |
| API 请求失败 | 显示错误提示 + 重试按钮 |
| 未登录用户 | 点击 "添加" 时提示登录 |
| 单词已在生词本 | 按钮显示 "✓ 已添加"，禁用状态 |
| 正在添加中 | 显示 Loading Spinner，禁用按钮 |
| 网络断开 | 显示离线提示，使用缓存数据 |

##### C. 全文翻译功能

**触发条件**:
- 用户点击顶部导航栏 "显示译文" 按钮
- 文章必须有 content 内容

**完整交互流程**:

```
用户点击 "显示译文" 按钮
    ↓
1️⃣ 【状态切换】toggleTranslation()
   - setShowTranslation(!showTranslation)
   - false → true：开始翻译
   - true → false：隐藏译文
    ↓
2️⃣ 【UI 响应】按钮样式变化
   - 未激活: 透明背景 + 金色边框 + 金色文字
   - 已激活: 金色背景 + 白色文字
   - 文字: "显示译文" ↔ "隐藏译文"
    ↓
3️⃣ 【渲染触发】每个段落下方显示 ParagraphTranslation 组件
   
   原文段落:
   ┌──────────────────────────────┐
   │ The technology sector continues │
   │ to evolve rapidly.              │
   └──────────────────────────────┘
    ↓
   翻译组件加载:
   ┌──────────────────────────────┐
   │ [Loading...] 翻译中...        │ ← 初始状态
   └──────────────────────────────┘
    ↓
4️⃣ 【TanStack Query】自动触发翻译请求
   - useTranslateText(paragraph)
   - queryKey: ['translate-text', paragraph]
   - 检查缓存 → 有则立即显示
    ↓
5️⃣ 【API 请求】阿里云翻译（如缓存未命中）
   POST /chat/completions
   Body: {
     model: "qwen-turbo",
     messages: [
       { 
         role: "user", 
         content: "Translate to Chinese: The technology sector..." 
       }
     ]
   }
    ↓
6️⃣ 【响应处理】
   - 成功: 显示中文译文
   - 失败: 显示 "翻译失败"（红色）
   - 加载中: 显示 Spinner + "翻译中..."
    ↓
7️⃣ 【最终 UI】
   
   原文段落:
   ┌──────────────────────────────┐
   │ The technology sector continues │
   │ to evolve rapidly.              │
   └──────────────────────────────┘
   
   译文区域:
   ┌──────────────────────────────┐
   │ | 科技行业持续快速发展。       │ ← 左侧竖线标识
   └──────────────────────────────┘
```

**技术实现细节**:

```typescript
// 1. 翻译按钮
<TouchableOpacity 
  style={[styles.translateButton, showTranslation && styles.translateButtonActive]}
  onPress={toggleTranslation}
>
  <Text style={[styles.translateButtonText, showTranslation && styles.translateButtonTextActive]}>
    {showTranslation ? '隐藏译文' : '显示译文'}
  </Text>
</TouchableOpacity>

// 2. 段落渲染（带翻译）
{article.content.split('\n\n').map((paragraph, pIndex) => {
  const tokens = paragraph.match(/[a-zA-Z]+|[^a-zA-Z]+/g) || [];
  
  return (
    <View key={pIndex} style={styles.paragraphWrapper}>
      {/* 英文原文 */}
      <View style={styles.paragraphContainer}>
        {tokens.map((token, tIndex) => {
          if (/^[a-zA-Z]+$/.test(token) && token.length >= 2) {
            return (
              <TouchableOpacity
                key={tIndex}
                onPress={() => handleWordPress(token, paragraph)}
              >
                <Text>{token}</Text>
              </TouchableOpacity>
            );
          }
          return <Text key={tIndex}>{token}</Text>;
        })}
      </View>
      
      {/* 中文翻译（条件渲染）*/}
      {showTranslation && (
        <ParagraphTranslation 
          paragraph={paragraph} 
          paragraphIndex={pIndex}
        />
      )}
    </View>
  );
})}

// 3. ParagraphTranslation 组件
function ParagraphTranslation({ paragraph, paragraphIndex }) {
  // TanStack Query 自动管理缓存和状态
  const { data: translatedText, isLoading, error } = useTranslateText(paragraph);
  
  if (isLoading) {
    return (
      <View style={styles.translationContainer}>
        <ActivityIndicator size="small" color="#C19A6B" />
        <Text style={styles.translatingText}>翻译中...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.translationContainer}>
        <Text style={styles.translationError}>翻译失败</Text>
      </View>
    );
  }
  
  if (translatedText) {
    return (
      <View style={styles.translationContainer}>
        <Text style={styles.translationText}>{translatedText}</Text>
      </View>
    );
  }
  
  return null;
}

// 4. 翻译 Hook
export function useTranslateText(text: string | null) {
  return useQuery({
    queryKey: ['translate-text', text],
    queryFn: () => {
      if (!text) return '';
      return aliyunLLMService.translateText(text);
    },
    enabled: !!text && text.length > 0,
    staleTime: cacheConfig.translation.staleTime,  // 7 天
    gcTime: cacheConfig.translation.gcTime,         // 30 天
  });
}
```

**样式设计**:

```typescript
// 译文容器
translationContainer: {
  paddingHorizontal: 4,
  paddingTop: 8,
  paddingBottom: 12,
  borderLeftWidth: 2,           // 左侧竖线
  borderLeftColor: '#E8E4DF',   // 浅灰色
  marginLeft: 8,                // 缩进
}

// 译文文字
translationText: {
  fontSize: 24,
  color: '#5C5C5C',             // 比原文稍浅
  lineHeight: 36,
  fontFamily: Platform.select({
    ios: 'PingFang SC',         // iOS 中文字体
    android: 'sans-serif',
    default: 'sans-serif',
  }),
}

// 翻译中提示
translatingText: {
  fontSize: 16,
  color: '#8B8680',
  marginTop: 4,
  fontStyle: 'italic',          // 斜体
}

// 翻译失败
translationError: {
  fontSize: 16,
  color: '#E74C3C',             // 红色
  marginTop: 4,
}
```

**性能优化策略**:

1. **按段落并行翻译**
   - 不是整篇文章一次性翻译
   - 每个段落独立请求，互不阻塞
   - 用户可以先看到已翻译的段落

2. **智能缓存**
   - staleTime: 7 天（翻译结果稳定）
   - gcTime: 30 天（长期保留）
   - 相同段落不会重复翻译

3. **渐进式加载**
   ```
   时间轴:
   0s  - 用户点击 "显示译文"
   1s  - 第1段翻译完成 ✓
   2s  - 第2段翻译完成 ✓
   3s  - 第3段翻译中...
   5s  - 全部翻译完成
   ```

4. **后台预加载**
   - 首次打开文章时，可以预加载翻译
   - 用户点击按钮时已有缓存
   - 实现 "秒开" 体验

**优势对比**:

| 方案 | 整篇翻译 | 按段落翻译 ✅ |
|------|---------|-------------|
| 首屏等待时间 | 10-20s | 1-2s |
| API 调用次数 | 1 次（长文本） | N 次（短文本） |
| 缓存命中率 | 低（整篇变化） | 高（段落复用） |
| 用户体验 | 长时间白屏 | 渐进式显示 |
| 失败影响 | 全部失败 | 部分失败 |

**边界情况处理**:

| 场景 | 处理方式 |
|------|---------|
| 空段落 | 跳过翻译，不渲染译文区域 |
| 纯数字/标点 | 正常翻译（可能返回原文） |
| API 超时 | 显示 "翻译失败"，可重试 |
| 网络断开 | 使用缓存，无缓存则显示错误 |
| 特殊字符 | LLM 自动处理，保持原意 |
| 超长段落 | 建议拆分，避免 token 限制 |

##### D. AI 语音朗读功能

**触发条件**:
- 文章必须有 content 内容
- 有 sourceUrl 时使用 AI TTS，否则使用浏览器 TTS

**两种模式对比**:

| 特性 | AI TTS (推荐) ✅ | 浏览器 TTS (降级) |
|------|----------------|------------------|
| 音质 | 自然流畅（Katerina音色） | 机械感较强 |
| 语速 | 可调节 | 固定 |
| 网络依赖 | 需要 | 不需要 |
| 兼容性 | 需 CORS 配置 | 所有现代浏览器 |
| 文件大小 | ~300KB (MP3) | 无文件 |
| 适用场景 | 有 sourceUrl 的文章 | 本地文章或无 URL |

---

#### 🎯 AI TTS 完整交互流程

```
用户点击 "🔊 朗读" 按钮
    ↓
1️⃣ 【状态检查】判断当前状态
   
   ├─ 情况 A: 音频正在播放
   │    → 调用 audioRef.current.pause()
   │    → 按钮文字变为 "▶️ 继续"
   │    → 结束
   │
   ├─ 情况 B: 音频已暂停
   │    → 调用 audioRef.current.play()
   │    → 按钮文字变为 "⏸ 暂停"
   │    → 结束
   │
   ├─ 情况 C: 正在生成音频
   │    → 直接返回，不响应点击
   │    → 防止重复请求
   │
   └─ 情况 D: 无音频或未开始
        → 进入生成流程 ↓
    ↓
2️⃣ 【sourceUrl 检查】
   
   ├─ 无 sourceUrl
   │    → 使用浏览器 TTS（降级方案）
   │    → speakText(cleanContent)
   │    → 结束
   │
   └─ 有 sourceUrl
        → 使用 AI TTS ↓
    ↓
3️⃣ 【UI 反馈】显示加载状态
   - setIsGeneratingAudio(true)
   - 按钮文字: "⏳ 生成中..."
   - 按钮禁用: disabled={true}
   - 透明度: opacity: 0.5
    ↓
4️⃣ 【API 请求】调用 FastAPI 生成音频
   
   POST http://120.79.1.150:8000/news/read
   Query Params:
     - url: encodeURIComponent(article.sourceUrl)
     - voice: "Katerina"
   Headers:
     - X-API-Key: sk-default-key-for-testing
     - Content-Type: application/json
    ↓
5️⃣ 【API 响应】
   
   成功:
   {
     "success": true,
     "message": "Audio generated successfully",
     "audio_file": "output_qwen_1776166076030.mp3",
     "duration_seconds": 22.56,
     "audio_size_bytes": 361004
   }
   
   失败:
   {
     "success": false,
     "message": "Failed to fetch article"
   }
    ↓
6️⃣ 【构建下载 URL】
   
   const url = `${baseUrl}/audio/download?filename=${audio_file}`
   // 示例:
   // http://120.79.1.150:8000/audio/download?filename=output_qwen_1776166076030.mp3
    ↓
7️⃣ 【状态更新】保存音频信息
   - setAudioUrl(url)
   - setAudioDuration(22.56)
    ↓
8️⃣ 【Fetch 下载】绕过 CORS/混合内容问题
   
   console.log('[ArticlePage] Downloading audio as blob...')
   
   const response = await fetch(url, {
     method: 'GET',
     headers: {
       'X-API-Key': 'sk-default-key-for-testing',
     },
     mode: 'cors',  // 强制 CORS 模式
   })
   
   if (!response.ok) {
     throw new Error(`Failed to download: ${response.status}`)
   }
   
   const blob = await response.blob()
   console.log('[ArticlePage] Audio downloaded, size:', blob.size, 'bytes')
    ↓
9️⃣ 【创建 Blob URL】
   
   const blobUrl = URL.createObjectURL(blob)
   // 示例: blob:https://stellular-bonbon-f987d3.netlify.app/xxx-xxx-xxx
   
   优势:
   - 绕过 HTTP/HTTPS 混合内容限制
   - 浏览器认为这是本地资源
   - 不受 CORS 策略影响（已在 fetch 时处理）
    ↓
🔟 【创建 Audio 对象】
   
   const audio = new Audio()
   audioRef.current = audio
   audio.src = blobUrl
   audio.preload = 'auto'
    ↓
1️⃣1️⃣ 【事件监听器绑定】
   
   // 加载完成可以播放
   audio.oncanplaythrough = () => {
     console.log('✅ Audio loaded, starting playback')
     audio.play().catch(playError => {
       console.error('❌ Play failed:', playError)
       Alert.alert('播放失败', playError.message)
       cleanup()  // 清理资源
     })
   }
   
   // 数据加载完成
   audio.onloadeddata = () => {
     console.log('Audio data loaded')
   }
   
   // 错误处理
   audio.onerror = (e) => {
     console.error('❌ Audio error:', e)
     console.error('Error code:', audio.error?.code)
     console.error('Error message:', audio.error?.message)
     
     // 根据错误代码提供详细提示
     let errorMessage = '无法加载音频文件'
     if (audio.error) {
       switch (audio.error.code) {
         case MediaError.MEDIA_ERR_ABORTED:
           errorMessage = '音频加载被中止'
           break
         case MediaError.MEDIA_ERR_NETWORK:
           errorMessage = '网络错误（可能是跨域问题）'
           break
         case MediaError.MEDIA_ERR_DECODE:
           errorMessage = '音频解码失败'
           break
         case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
           errorMessage = '音频源不支持（CORS 或格式问题）'
           break
       }
     }
     
     Alert.alert(
       '加载失败',
       `${errorMessage}\n\n` +
       `原因：服务器未配置 CORS 响应头\n\n` +
       `解决方案：请在服务器上添加 CORS 配置`
     )
     cleanup()
   }
   
   // 播放结束
   audio.onended = () => {
     console.log('✅ Audio playback ended')
     cleanup()
   }
   
   // 清理函数
   const cleanup = () => {
     setAudioUrl(null)
     audioRef.current = null
     URL.revokeObjectURL(blobUrl)  // 释放内存
   }
    ↓
1️⃣2️⃣ 【开始加载】
   
   audio.load()
   // 触发 oncanplaythrough 或 onerror
    ↓
1️⃣3️⃣ 【UI 更新】
   - setIsGeneratingAudio(false)
   - 按钮文字: "⏸ 暂停"（如果正在播放）
   - 按钮样式: 金色背景 + 白色文字
    ↓
1️⃣4️⃣ 【播放控制】
   
   用户再次点击按钮:
   ├─ 正在播放 → 暂停
   │    audio.pause()
   │    按钮: "▶️ 继续"
   │
   └─ 已暂停 → 继续播放
        audio.play()
        按钮: "⏸ 暂停"
    ↓
1️⃣5️⃣ 【播放结束】
   
   onended 触发:
   - 清空 audioUrl
   - 清空 audioRef
   - 释放 Blob URL
   - 按钮恢复为 "🔊 朗读"
```

---

#### 🌐 浏览器 TTS 降级方案

**触发条件**:
- 文章没有 sourceUrl
- 或 AI TTS API 不可用

**交互流程**:

```
用户点击 "🔊 朗读"
    ↓
1️⃣ 【检查 isSpeaking 状态】
   
   ├─ 正在朗读
   │    → stopSpeaking()
   │    → 停止语音合成
   │    → 按钮: "🔊 朗读"
   │
   └─ 未朗读
        → 准备朗读 ↓
    ↓
2️⃣ 【内容预处理】
   
   const cleanContent = article.content
     .split('\n\n')              // 按段落分割
     .map(p => p.trim())         // 去除首尾空格
     .filter(p => p.length > 0)  // 过滤空段落
     .join('. ')                 // 用句号连接
   
   示例:
   "Paragraph 1. Paragraph 2. Paragraph 3."
    ↓
3️⃣ 【调用 Web Speech API】
   
   speakText(cleanContent)
   
   内部实现:
   const utterance = new SpeechSynthesisUtterance(text)
   utterance.lang = 'en-US'
   utterance.rate = 0.85  // 稍慢，适合学习
   speechSynthesis.speak(utterance)
    ↓
4️⃣ 【UI 更新】
   - isSpeaking = true
   - 按钮文字: "⏸ 暂停"
   - 按钮样式: 激活状态
    ↓
5️⃣ 【播放控制】
   
   用户再次点击:
   ├─ 正在朗读 → 停止
   │    stopSpeaking()
   │    speechSynthesis.cancel()
   │    按钮: "🔊 朗读"
   │
   └─ 已停止 → 重新开始
        speakText(cleanContent)
```

---

#### 🔧 技术实现细节

```typescript
// 1. 状态管理
const [audioUrl, setAudioUrl] = useState<string | null>(null);
const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
const [audioDuration, setAudioDuration] = useState<number | null>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);

// 2. 主处理函数
const handleReadFullArticle = async () => {
  if (!article?.content) return;
  
  // 情况 A & B: 已有音频，控制播放/暂停
  if (audioUrl && audioRef.current) {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    return;
  }
  
  // 情况 C: 正在生成，忽略点击
  if (isGeneratingAudio) return;
  
  // 情况 D-1: 无 sourceUrl，使用浏览器 TTS
  if (!article.sourceUrl) {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const cleanContent = article.content
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .join('. ');
      speakText(cleanContent);
    }
    return;
  }
  
  // 情况 D-2: 有 sourceUrl，使用 AI TTS
  setIsGeneratingAudio(true);
  try {
    // Step 4: API 请求
    const result = await articleAudioService.generateArticleAudio(article.sourceUrl);
    
    if (result.success && result.audio_file) {
      // Step 6: 构建 URL
      const url = articleAudioService.getAudioUrl(result.audio_file);
      console.log('[ArticlePage] Attempting to play audio from:', url);
      
      // Step 7: 更新状态
      setAudioUrl(url);
      setAudioDuration(result.duration_seconds || null);
      
      // Step 8: Fetch 下载为 Blob
      console.log('[ArticlePage] Downloading audio as blob...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': 'sk-default-key-for-testing',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('[ArticlePage] Audio downloaded as blob, size:', blob.size, 'bytes');
      
      // Step 10: 创建 Audio 对象
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = blobUrl;
      audio.preload = 'auto';
      
      // Step 11: 事件监听
      audio.oncanplaythrough = () => {
        console.log('[ArticlePage] ✅ Audio loaded, starting playback');
        audio.play().catch(playError => {
          console.error('[ArticlePage] ❌ Play failed:', playError);
          Alert.alert('播放失败', '无法播放音频: ' + playError.message);
          cleanup();
        });
      };
      
      audio.onerror = (e) => {
        console.error('[ArticlePage] ❌ Audio error:', e);
        console.error('[ArticlePage] Error code:', audio.error?.code);
        console.error('[ArticlePage] Error message:', audio.error?.message);
        
        let errorMessage = '无法加载音频文件';
        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = '音频加载被中止';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = '网络错误，无法加载音频（可能是跨域问题）';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = '音频解码失败，文件格式可能不支持';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '音频源不支持（HTTP/HTTPS 混合内容或 CORS 问题）';
              break;
          }
        }
        
        Alert.alert(
          '加载失败', 
          `${errorMessage}\n\n` +
          `原因：服务器未配置 CORS 响应头\n\n` +
          `解决方案：请在服务器上添加 CORS 配置，允许跨域访问音频文件`
        );
        cleanup();
      };
      
      audio.onended = () => {
        console.log('[ArticlePage] ✅ Audio playback ended');
        cleanup();
      };
      
      // Step 12: 开始加载
      audio.load();
    } else {
      throw new Error(result.message || '生成音频失败');
    }
  } catch (error: any) {
    console.error('[ArticlePage] Failed to generate audio:', error);
    Alert.alert('生成失败', error?.message || '无法生成音频，请检查网络连接');
  } finally {
    setIsGeneratingAudio(false);
  }
};

// 清理函数
const cleanup = () => {
  setAudioUrl(null);
  audioRef.current = null;
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);  // 释放内存
  }
};
```

---

#### 🎨 UI 按钮设计

```typescript
<TouchableOpacity 
  style={[
    styles.readAloudButton, 
    // 激活状态：正在播放
    (isSpeaking || (audioUrl && audioRef.current && !audioRef.current.paused)) && styles.readAloudButtonActive,
    // 禁用状态：生成中
    isGeneratingAudio && styles.readAloudButtonDisabled
  ]}
  onPress={handleReadFullArticle}
  disabled={isGeneratingAudio}
>
  <Text style={[
    styles.readAloudButtonText, 
    (isSpeaking || (audioUrl && audioRef.current && !audioRef.current.paused)) && styles.readAloudButtonTextActive,
    isGeneratingAudio && styles.readAloudButtonTextDisabled
  ]}>
    {isGeneratingAudio ? '⏳ 生成中...' : 
     (audioUrl && audioRef.current && !audioRef.current.paused) ? '⏸ 暂停' :
     (isSpeaking || (audioUrl && audioRef.current)) ? '▶️ 继续' : '🔊 朗读'}
  </Text>
</TouchableOpacity>
```

**按钮状态样式**:

| 状态 | 背景色 | 边框 | 文字颜色 | 文字内容 |
|------|--------|------|---------|----------|
| 默认 | 透明 | 1px 金色 | 金色 | 🔊 朗读 |
| 生成中 | 透明 | 1px 金色 | 灰色 | ⏳ 生成中... |
| 播放中 | 金色 | 无 | 白色 | ⏸ 暂停 |
| 已暂停 | 透明 | 1px 金色 | 金色 | ▶️ 继续 |

---

#### ⚠️ 常见问题与解决

**1. CORS 跨域问题**

症状:
```
MediaError code: 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
Error message: "Format error"
```

原因:
- 服务器未配置 CORS 响应头
- 浏览器拒绝从 HTTPS 页面加载 HTTP 资源

解决:
```python
# FastAPI 服务器端
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

验证:
```bash
curl -I "http://120.79.1.150:8000/audio/download?filename=test.mp3" \
  -H "Origin: https://your-domain.netlify.app" | grep access-control
```

应返回:
```
access-control-allow-origin: *
access-control-allow-credentials: true
```

**2. HTTP/HTTPS 混合内容**

症状:
- HTTPS 页面无法加载 HTTP 音频
- 控制台警告: "Mixed Content"

解决:
- 使用 fetch 下载为 Blob
- 通过 `URL.createObjectURL()` 创建 Blob URL
- 浏览器认为这是本地资源

**3. 内存泄漏**

问题:
- Blob URL 未释放
- 多次生成音频导致内存增长

解决:
```typescript
// 在适当时机释放
URL.revokeObjectURL(blobUrl);

// 触发时机:
// - 播放结束 (onended)
// - 发生错误 (onerror)
// - 组件卸载 (useEffect cleanup)
```

**4. 音频格式不支持**

检查:
```typescript
console.log('Audio MIME type:', blob.type);
// 应该是: "audio/mpeg" 或 "audio/mp3"
```

支持格式:
- MP3 ✅
- WAV ✅
- OGG ✅
- FLAC ❌ (部分浏览器不支持)

---

**性能优化**:

1. **Blob URL 复用**
   - 同一篇文章只生成一次
   - 播放/暂停不重新下载

2. **预加载策略**
   ```typescript
   audio.preload = 'auto'  // 自动预加载
   ```

3. **内存管理**
   - 播放结束后立即释放 Blob URL
   - 避免累积未释放的对象

4. **错误重试**
   - 网络错误可手动重试
   - 不自动重试（避免浪费流量）

---

### 3️⃣ 生词本模块 (Vocabulary)

#### 功能描述
管理用户收藏的单词，支持批量操作、学习进度追踪和复习提醒。

---

#### 📋 A. 单词列表展示

**页面加载流程**:

```
用户进入生词本页面
    ↓
1️⃣ 【登录检查】
   
   const { user } = useAuthStore()
   
   ├─ 未登录
   │    → 显示 EmptyState
   │    → 图标: 🔒
   │    → 标题: "请先登录"
   │    → 按钮: "去登录" → /auth/login
   │
   └─ 已登录
        → 继续加载 ↓
    ↓
2️⃣ 【数据请求】TanStack Query
   
   const { data: vocabularies, isLoading } = useVocabularies()
   
   queryKey: ['vocabularies', userId]
   queryFn: () => vocabularyService.getVocabularies(userId)
    ↓
3️⃣ 【Supabase 查询】
   
   const { data, error } = await supabase
     .from('vocabularies')
     .select('*')
     .eq('user_id', userId)
     .order('created_at', { ascending: false })
    ↓
4️⃣ 【UI 状态分支】
   
   ├─ isLoading = true
   │    → 显示 <Loading /> 组件
   │    → Spinner + "加载中..."
   │
   ├─ error
   │    → 显示错误提示
   │    → 重试按钮
   │
   └─ data 返回
        → 渲染列表 ↓
    ↓
5️⃣ 【统计计算】
   
   const totalCount = vocabularies.length
   const masteredCount = vocabularies.filter(v => v.mastered).length
   const learningCount = totalCount - masteredCount
   const masteryRate = totalCount > 0 
     ? Math.round((masteredCount / totalCount) * 100) 
     : 0
    ↓
6️⃣ 【渲染统计面板】
   
   ┌──────────────────────────────────────┐
   │  📖 生词本                     [选择] │ ← 头部
   ├──────────────────────────────────────┤
   │  总单词      学习中       已掌握      │ ← 统计栏
   │   125         98          27         │
   └──────────────────────────────────────┘
    ↓
7️⃣ 【渲染单词列表】
   
   <ScrollView>
     {vocabularies.map(vocab => (
       <VocabularyCard key={vocab.id} vocab={vocab} />
     ))}
   </ScrollView>
```

**单词卡片结构**:

```typescript
┌──────────────────────────────────────────┐
│  [ ] sophisticated                  [🗑] │ ← 复选框 + 删除按钮
│                                          │
│  sophisticated                           │ ← 单词（大字加粗）
│  /səˈfɪstɪkeɪtɪd/                       │ ← 音标（如果有）
│                                          │
│  复杂的；精密的                           │ ← 释义
│                                          │
│  Context:                                │ ← 上下文标签
│  The sophisticated algorithm processes   │ ← 上下文句子
│  large amounts of data efficiently.      │
│                                          │
│  2024-04-13  ·  来自: TechCrunch        │ ← 添加时间 + 来源
└──────────────────────────────────────────┘
```

**卡片交互**:

| 点击区域 | 动作 |
|---------|------|
| 卡片主体 | 跳转到详情页 `/vocabulary/[id]` |
| 复选框 | 切换选中状态（仅在选择模式） |
| 删除按钮 | 直接删除（弹出确认对话框） |

---

#### 🗂️ B. 批量操作模式

**完整交互流程**:

```
用户点击右上角 "选择" 按钮
    ↓
1️⃣ 【进入选择模式】
   
   toggleSelectMode()
   ↓
   setIsSelectMode(!isSelectMode)  // false → true
   setSelectedIds(new Set())       // 清空选中项
    ↓
2️⃣ 【UI 变化】
   
   头部:
   ┌──────────────────────────────────────┐
   │  📖 生词本                     [完成] │ ← 按钮文字变化
   └──────────────────────────────────────┘
   
   每个卡片显示复选框:
   ┌──────────────────────────────────────────┐
   │  ☑️ sophisticated                   [🗑] │
   │  ☐ advanced                         [🗑] │
   │  ☑️ algorithm                       [🗑] │
   └──────────────────────────────────────────┘
   
   底部浮动操作栏出现:
   ┌──────────────────────────────────────┐
   │  已选中 2 项           [删除选中(2)]  │
   └──────────────────────────────────────┘
    ↓
3️⃣ 【用户勾选单词】
   
   用户点击复选框:
   toggleSelect(vocab.id)
   ↓
   const newSelected = new Set(selectedIds)
   if (newSelected.has(id)) {
     newSelected.delete(id)  // 取消选中
   } else {
     newSelected.add(id)     // 选中
   }
   setSelectedIds(newSelected)
    ↓
4️⃣ 【底部栏更新】
   
   已选中数量实时更新:
   - 0 项 → 按钮禁用
   - 1 项 → "删除选中(1)"
   - 2 项 → "删除选中(2)"
   - n 项 → "删除选中(n)"
    ↓
5️⃣ 【用户点击 "删除选中"】
   
   handleBatchDelete()
   ↓
   检查 selectedIds.size
   ├─ size === 0
   │    → Alert.alert('提示', '请选择要删除的单词')
   │
   └─ size > 0
        → 显示确认对话框 ↓
    ↓
6️⃣ 【二次确认对话框】
   
   Alert.alert(
     '批量删除',
     `确定要删除选中的 ${selectedIds.size} 个单词吗？`,
     [
       { text: '取消', style: 'cancel' },
       { 
         text: '删除', 
         style: 'destructive',
         onPress: async () => {
           // 执行删除
         }
       },
     ]
   )
    ↓
7️⃣ 【用户确认删除】
   
   并行执行删除请求:
   await Promise.all(
     Array.from(selectedIds).map(id => 
       deleteMutation.mutateAsync(id)
     )
   )
    ↓
8️⃣ 【乐观更新 UI】
   
   TanStack Query onMutate:
   - 立即从列表中移除选中的单词
   - 用户看到即时反馈
   - 后台执行实际删除请求
    ↓
9️⃣ 【清理状态】
   
   setSelectedIds(new Set())      // 清空选中
   setIsSelectMode(false)         // 退出选择模式
    ↓
🔟 【重新拉取列表】
   
   await refetch()
   - 确保数据一致性
   - 更新统计数字
    ↓
1️⃣1️⃣ 【成功提示】
   
   Toast 或 Alert:
   "✅ 已成功删除 X 个单词"
```

**技术实现**:

```typescript
// 1. 状态管理
const [isSelectMode, setIsSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 2. 切换选择模式
const toggleSelectMode = () => {
  setIsSelectMode(!isSelectMode);
  setSelectedIds(new Set());  // 清空选中
};

// 3. 切换单个单词选中状态
const toggleSelect = (id: string) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedIds(newSelected);
};

// 4. 批量删除
const handleBatchDelete = () => {
  if (selectedIds.size === 0) {
    Alert.alert('提示', '请选择要删除的单词');
    return;
  }

  Alert.alert(
    '批量删除',
    `确定要删除选中的 ${selectedIds.size} 个单词吗？`,
    [
      { text: '取消', style: 'cancel' },
      { 
        text: '删除', 
        style: 'destructive',
        onPress: async () => {
          try {
            // 并行删除
            await Promise.all(
              Array.from(selectedIds).map(id => 
                deleteMutation.mutateAsync(id)
              )
            );
            
            // 清理状态
            setSelectedIds(new Set());
            setIsSelectMode(false);
            
            // 重新拉取
            await refetch();
          } catch (error) {
            Alert.alert('删除失败', '部分单词删除失败，请重试');
          }
        }
      },
    ]
  );
};

// 5. 删除 Mutation（带乐观更新）
const deleteMutation = useMutation({
  mutationFn: (id: string) => vocabularyService.deleteVocabulary(id),
  
  onMutate: async (id) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries(['vocabularies']);
    
    // 保存之前的值
    const previous = queryClient.getQueryData(['vocabularies']);
    
    // 乐观更新：立即从列表中移除
    queryClient.setQueryData(['vocabularies'], (old: Vocabulary[]) => 
      old?.filter(v => v.id !== id)
    );
    
    return { previous };
  },
  
  onError: (err, id, context) => {
    // 失败回滚
    queryClient.setQueryData(['vocabularies'], context.previous);
    Alert.alert('删除失败', '请稍后重试');
  },
  
  onSettled: () => {
    // 无论成功失败，都重新验证
    queryClient.invalidateQueries(['vocabularies']);
  },
});
```

**性能优化**:

1. **并行删除**
   ```typescript
   // ❌ 串行删除（慢）
   for (const id of selectedIds) {
     await deleteMutation.mutateAsync(id);
   }
   
   // ✅ 并行删除（快）
   await Promise.all(
     Array.from(selectedIds).map(id => deleteMutation.mutateAsync(id))
   );
   ```

2. **乐观更新**
   - 用户点击删除后立即看到效果
   - 不等待服务器响应
   - 失败时自动回滚

3. **防抖处理**
   - 快速点击复选框不会重复触发
   - React 状态更新 batching

---

#### 📖 C. 单词详情查看

**触发方式**: 点击单词卡片主体（非复选框和删除按钮）

**跳转路由**: `/vocabulary/[id]`

**详情页内容结构**:

```
┌──────────────────────────────────────────┐
│  ← 返回                                  │ ← 导航栏
├──────────────────────────────────────────┤
│                                          │
│         sophisticated                    │ ← 单词（居中，超大字）
│         /səˈfɪstɪkeɪtɪd/                 │ ← 音标
│                                          │
│         [🔊 发音]                        │ ← TTS 按钮
│                                          │
├──────────────────────────────────────────┤
│  释义                                     │
│  ─────────────────────────────────────   │
│  1. 复杂的；精密的                         │
│  2. 老练的；富有经验的                     │
│                                          │
├──────────────────────────────────────────┤
│  例句                                     │
│  ─────────────────────────────────────   │
│  • This is a sophisticated system.       │
│    这是一个复杂的系统。                     │
│                                          │
│  • She has sophisticated taste.          │
│    她有高雅的品味。                         │
│                                          │
├──────────────────────────────────────────┤
│  记忆技巧                                 │
│  ─────────────────────────────────────   │
│  🎯 sophisti-cated → 复杂的猫             │
│     （谐音记忆法）                         │
│                                          │
├──────────────────────────────────────────┤
│  来源                                     │
│  ─────────────────────────────────────   │
│  📰 TechCrunch                           │
│  🔗 View Article →                       │ ← 可点击跳转
│                                          │
├──────────────────────────────────────────┤
│  添加时间: 2024-04-13                    │
│  复习次数: 3 次                           │
│  最后复习: 2 天前                         │
│                                          │
├──────────────────────────────────────────┤
│  [标记为已掌握]    [删除]                 │ ← 底部操作按钮
└──────────────────────────────────────────┘
```

**交互逻辑**:

| 操作 | 行为 |
|------|------|
| 点击 "发音" | 调用 Web Speech API 朗读单词 |
| 点击 "View Article" | 打开来源文章链接 |
| 点击 "标记为已掌握" | 更新 mastered = true |
| 点击 "删除" | 删除单词，返回列表页 |

---

#### 🔄 D. 复习模式（预留）

**当前状态**: 
- Tab 栏有 "背单词" 入口 (`/review`)
- 页面为空（review.tsx 文件存在但无内容）

**计划功能**:

1. **间隔重复算法 (SRS)**
   - 基于艾宾浩斯遗忘曲线
   - 动态调整复习间隔
   - 掌握度评估

2. **复习流程**
   ```
   显示单词 → 用户回想 → 翻转卡片 → 自我评估 → 安排下次复习
   ```

3. **评估等级**
   - Again (忘记了) → 1 分钟后
   - Hard (困难) → 10 分钟后
   - Good (良好) → 1 天后
   - Easy (简单) → 4 天后

#### 数据结构
```typescript
interface Vocabulary {
  id: string;
  user_id: string;
  word: string;
  meaning: string;
  example?: string;
  context_sentence?: string;  // 上下文句子
  article_url?: string;       // 来源文章链接
  article_id?: string;
  created_at: string;
  review_count: number;
  last_review_at?: string;
  mastered: boolean;
}
```

#### 文件位置
```
app/(tabs)/vocabulary.tsx      # 生词本列表
app/vocabulary/[id].tsx        # 单词详情页
services/vocabulary-service.ts # CRUD 服务
hooks/use-vocabulary.ts        # TanStack Query Hooks
types/vocabulary.ts            # 类型定义
```

---

### 4️⃣ 用户认证模块 (Auth)

#### 功能描述
基于 Supabase Auth 的用户注册、登录和会话管理，提供无缝的身份验证体验。

---

#### 🔐 A. 注册流程

**完整交互流程**:

```
用户访问 /auth/register
    ↓
1️⃣ 【页面渲染】
   
   ┌──────────────────────────────────────┐
   │                                      │
   │         🎓 AI English Learner        │
   │                                      │
   │         创建账号                      │
   │                                      │
   │   邮箱: [____________________]       │
   │   密码: [____________________]       │
   │   确认: [____________________]       │
   │                                      │
   │   [      注册      ]                 │
   │                                      │
   │   已有账号？去登录                     │
   │                                      │
   └──────────────────────────────────────┘
    ↓
2️⃣ 【用户输入】
   
   - 邮箱: user@example.com
   - 密码: Password123!
   - 确认密码: Password123!
    ↓
3️⃣ 【前端验证】
   
   const validateForm = () => {
     // 邮箱格式检查
     if (!email.includes('@')) {
       Alert.alert('错误', '请输入有效的邮箱地址');
       return false;
     }
     
     // 密码强度检查
     if (password.length < 6) {
       Alert.alert('错误', '密码至少 6 个字符');
       return false;
     }
     
     // 密码一致性检查
     if (password !== confirmPassword) {
       Alert.alert('错误', '两次输入的密码不一致');
       return false;
     }
     
     return true;
   }
    ↓
4️⃣ 【提交表单】
   
   用户点击 "注册" 按钮
   ↓
   if (!validateForm()) return;  // 验证失败则中止
   ↓
   setLoading(true);  // 显示 Loading 状态
    ↓
5️⃣ 【调用 Supabase Auth】
   
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'Password123!',
   })
   
   配置:
   - flowType: 'implicit'  ← 跳过邮件验证
   - autoRefreshToken: true
   - persistSession: true
    ↓
6️⃣ 【响应处理】
   
   ├─ 成功
   │    {
   │      user: { id: 'xxx', email: '...' },
   │      session: { access_token: '...', ... }
   │    }
   │    ↓
   │    自动保存 Session 到 AsyncStorage
   │    ↓
   │    Zustand Store 更新:
   │    setUser(data.user)
   │    ↓
   │    跳转到首页 /
   │    ↓
   │    显示成功提示:
   │    Toast.show('✅ 注册成功！')
   │
   └─ 失败
        {
          error: {
            message: 'User already registered'
          }
        }
        ↓
        setLoading(false)
        ↓
        Alert.alert('注册失败', error.message)
```

**技术实现**:

```typescript
// app/auth/register.tsx
export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // 1. 前端验证
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // 2. 调用 Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // 3. 更新全局状态
      if (data.user) {
        setUser(data.user);
      }
      
      // 4. 跳转首页
      router.replace('/');
      
      // 5. 成功提示
      Toast.show({ type: 'success', text1: '✅ 注册成功！' });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('注册失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>创建账号</Text>
      
      <TextInput
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        placeholder="确认密码"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <Button
        title="注册"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
      />
      
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text>已有账号？去登录</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

#### 🔑 B. 登录流程

**完整交互流程**:

```
用户访问 /auth/login
    ↓
1️⃣ 【页面渲染】
   
   ┌──────────────────────────────────────┐
   │                                      │
   │         🎓 AI English Learner        │
   │                                      │
   │         欢迎回来                      │
   │                                      │
   │   邮箱: [____________________]       │
   │   密码: [____________________]       │
   │                                      │
   │   [      登录      ]                 │
   │                                      │
   │   没有账号？去注册                     │
   │                                      │
   └──────────────────────────────────────┘
    ↓
2️⃣ 【用户输入】
   
   - 邮箱: user@example.com
   - 密码: Password123!
    ↓
3️⃣ 【前端验证】
   
   if (!email || !password) {
     Alert.alert('错误', '请填写所有字段');
     return;
   }
    ↓
4️⃣ 【提交表单】
   
   用户点击 "登录" 按钮
   ↓
   setLoading(true)
    ↓
5️⃣ 【调用 Supabase Auth】
   
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'Password123!',
   })
    ↓
6️⃣ 【响应处理】
   
   ├─ 成功
   │    {
   │      user: { id: 'xxx', email: '...' },
   │      session: {
   │        access_token: 'eyJ...'
   │        refresh_token: 'eyJ...'
   │        expires_at: 1234567890
   │      }
   │    }
   │    ↓
   │    Session 自动保存到 AsyncStorage
   │    （由 Supabase Client 配置决定）
   │    ↓
   │    Token 自动刷新机制启动:
   │    - 每 55 分钟刷新一次
   │    - 过期前 5 分钟自动续期
   │    ↓
   │    Zustand Store 更新:
   │    setUser(data.user)
   │    ↓
   │    跳转到首页 /
   │    ↓
   │    显示欢迎提示:
   │    Toast.show('👋 欢迎回来！')
   │
   └─ 失败
        {
          error: {
            message: 'Invalid login credentials'
          }
        }
        ↓
        setLoading(false)
        ↓
        Alert.alert('登录失败', '邮箱或密码错误')
```

**技术实现**:

```typescript
// app/auth/login.tsx
export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
      }
      
      router.replace('/');
      Toast.show({ type: 'success', text1: '👋 欢迎回来！' });
      
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('登录失败', '邮箱或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎回来</Text>
      
      <TextInput
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title="登录"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
      />
      
      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text>没有账号？去注册</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

#### 🚪 C. 登出流程

**触发方式**: 点击头像/设置中的 "退出登录" 按钮

**完整交互流程**:

```
用户点击 "退出登录"
    ↓
1️⃣ 【二次确认】
   
   Alert.alert(
     '退出登录',
     '确定要退出吗？',
     [
       { text: '取消', style: 'cancel' },
       { 
         text: '退出', 
         style: 'destructive',
         onPress: handleLogout
       },
     ]
   )
    ↓
2️⃣ 【用户确认退出】
   
   handleLogout()
   ↓
   setLoading(true)
    ↓
3️⃣ 【调用 Supabase Auth】
   
   await supabase.auth.signOut()
    ↓
4️⃣ 【清除本地数据】
   
   - AsyncStorage 中的 Session 被清除
   - TanStack Query 缓存被清空
   - Zustand Store 重置:
     setUser(null)
    ↓
5️⃣ 【路由重定向】
   
   router.replace('/auth/login')
    ↓
6️⃣ 【UI 更新】
   
   setLoading(false)
   Toast.show({ type: 'info', text1: '已退出登录' })
```

**技术实现**:

```typescript
// store/auth-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
}));

// 组件中使用
const { signOut } = useAuthStore();

const handleLogout = async () => {
  Alert.alert(
    '退出登录',
    '确定要退出吗？',
    [
      { text: '取消', style: 'cancel' },
      { 
        text: '退出', 
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth/login');
            Toast.show({ type: 'info', text1: '已退出登录' });
          } catch (error) {
            Alert.alert('退出失败', '请稍后重试');
          }
        }
      },
    ]
  );
};
```

---

#### 🔄 D. 会话管理

**自动登录机制**:

```
应用启动
    ↓
1️⃣ 【Supabase Client 初始化】
   
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
     auth: {
       storage: AsyncStorage,        // 使用 AsyncStorage 存储
       autoRefreshToken: true,       // 自动刷新 Token
       persistSession: true,         // 持久化 Session
       detectSessionInUrl: false,    // Web 平台不检测 URL
       flowType: 'implicit',         // 隐式流程（无需邮件验证）
     },
   })
    ↓
2️⃣ 【检查本地 Session】
   
   supabase.auth.getSession()
    ↓
   ├─ 有有效 Session
   │    → 提取 User 信息
   │    → 更新 Zustand Store
   │    → 用户保持登录状态
   │
   └─ 无 Session 或已过期
        → user = null
        → 需要重新登录
    ↓
3️⃣ 【监听认证状态变化】
   
   supabase.auth.onAuthStateChange((event, session) => {
     switch (event) {
       case 'SIGNED_IN':
         setUser(session.user);
         break;
       case 'SIGNED_OUT':
         setUser(null);
         break;
       case 'TOKEN_REFRESHED':
         // Token 自动刷新，无需用户操作
         console.log('Token refreshed');
         break;
     }
   })
```

**Token 刷新机制**:

```
时间轴:
0min    - 用户登录，获得 Access Token (有效期 1h)
55min   - 后台自动刷新 Token
59min   - 如果上次刷新失败，再次尝试
60min   - Access Token 过期，但已刷新为新 Token
115min  - 第二次自动刷新
...
```

**受保护路由**:

以下页面需要登录后访问：

| 路由 | 未登录行为 |
|------|----------|
| `/vocabulary` | 显示 EmptyState + "去登录" 按钮 |
| `/stats` | 显示 EmptyState + "去登录" 按钮 |
| `/article/[id]` | 可以查看，但 "添加到生词本" 提示登录 |

**实现示例**:

```typescript
// app/(tabs)/vocabulary.tsx
export default function VocabularyScreen() {
  const { user } = useAuthStore();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🔒"
          title="请先登录"
          description="登录后才能查看生词本"
          action={
            <Button
              title="去登录"
              onPress={() => router.push('/auth/login')}
              variant="primary"
            />
          }
        />
      </View>
    );
  }
  
  // 正常渲染生词本列表
  return <VocabularyList />;
}
```
1. 调用 `supabase.auth.signOut()`
2. 清除本地存储
3. 跳转到登录页

#### 状态管理
使用 Zustand 全局状态：
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}
```

#### 受保护路由
以下页面需要登录后访问：
- `/vocabulary` - 生词本
- `/stats` - 学习统计
- `/article/[id]` - 添加生词功能

未登录时显示提示并引导去登录。

#### 文件位置
```
app/auth/login.tsx             # 登录页
app/auth/register.tsx          # 注册页
store/auth-store.ts            # Zustand 状态管理
services/auth-service.ts       # 认证服务
hooks/useAuth.ts               # 认证 Hook
```

---

### 5️⃣ 学习统计模块 (Stats)

#### 功能描述
可视化展示用户的学习数据和进度。

#### 统计维度
- **阅读统计**
  - 总阅读文章数
  - 总阅读时长
  - 平均每日阅读量
  
- **词汇统计**
  - 生词本总量
  - 本周新增单词
  - 掌握率趋势图
  
- **学习连续性**
  - 连续学习天数
  - 最长连续记录
  - 最近一次学习时间

#### 文件位置
```
app/(tabs)/stats.tsx           # 统计页
components/stats/              # 统计图表组件
services/progress-service.ts   # 进度追踪服务
```

---

### 6️⃣ AI 缓存管理模块

#### 功能描述
管理和监控 AI 生成内容的缓存状态，优化 API 调用成本。

#### 缓存策略

##### A. 缓存层级
1. **内存缓存**（TanStack Query）
   - staleTime: 根据数据类型设定
   - gcTime: 垃圾回收时间
   
2. **持久化缓存**（AsyncStorage）
   - 跨会话保留
   - 手动清除选项

3. **数据库缓存**（Supabase ai_cache 表）
   - 长期存储
   - 多设备同步
   - 内容哈希去重

##### B. 缓存类型
- **wordDetailWithContext**: 24 小时
- **translation**: 7 天
- **articleContent**: 1 小时
- **aiGeneratedImage**: 30 天

##### C. 缓存管理界面
功能：
- 查看各类型缓存数量
- 手动清除指定缓存
- 清除全部缓存
- 显示缓存命中率统计

#### 数据库表结构
```sql
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,        -- 'word_detail', 'translation' 等
  content_hash TEXT NOT NULL UNIQUE, -- SHA256 哈希
  input_data JSONB,                  -- 输入参数
  output_data JSONB NOT NULL,        -- AI 输出
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 文件位置
```
app/(tabs)/ai-cache-manager.tsx  # 缓存管理页
services/ai-cache-service.ts     # 缓存服务
lib/cache-config.ts              # 缓存配置
lib/query-client.ts              # Query Client 配置
```

---

## 技术架构

### 前端框架
- **React Native (Expo SDK 54)**
  - 跨平台支持（Web、iOS、Android）
  - Metro Bundler
  - Expo Router（文件系统路由）
  
- **TypeScript 5.9**
  - 严格类型检查
  - 接口定义完整

### 状态管理
- **Zustand** - 全局状态（用户认证）
- **TanStack Query v5** - 服务端状态管理
  - 自动缓存
  - 后台刷新
  - 乐观更新
  - 持久化（AsyncStorage）

### UI 库
- **NativeWind v4** - Tailwind CSS for React Native
- **React Native Paper** - Material Design 组件
- **自定义主题系统** (`theme/` 目录)

### 后端服务
- **Supabase**
  - PostgreSQL 数据库
  - Authentication（邮箱密码）
  - Row Level Security (RLS)
  - 实时订阅（可选）

- **自定义 FastAPI 服务**
  - 地址: `http://120.79.1.150:8000`
  - TechCrunch 新闻爬虫
  - AI TTS 语音合成
  - CORS 已配置

- **阿里云 DashScope API**
  - Qwen LLM（单词解释、翻译）
  - Wanxiang 文生图（Flash Card 配图）

### 数据存储
- **AsyncStorage** - 本地持久化
  - TanStack Query 缓存
  - 文章离线缓存
  - 用户偏好设置

- **Supabase PostgreSQL** - 云端数据库
  - 用户数据
  - 生词本
  - 阅读进度
  - AI 缓存

---

## 数据库设计

### 表结构概览

#### 1. articles（文章表）
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  estimated_time INTEGER NOT NULL,  -- 分钟
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. vocabularies（生词本表）
```sql
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  context_sentence TEXT,            -- 上下文句子
  article_url TEXT,                 -- 来源文章链接
  article_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_review_at TIMESTAMP,
  mastered BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, word)
);

-- RLS 策略
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vocabularies" 
  ON vocabularies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vocabularies" 
  ON vocabularies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vocabularies" 
  ON vocabularies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vocabularies" 
  ON vocabularies FOR DELETE USING (auth.uid() = user_id);
```

#### 3. reading_progress（阅读进度表）
```sql
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0,       -- 0-100
  time_spent INTEGER DEFAULT 0,     -- 秒
  completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);
```

#### 4. ai_cache（AI 缓存表）
```sql
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,       -- 'word_detail', 'translation' 等
  content_hash TEXT NOT NULL UNIQUE,-- SHA256(input_data)
  input_data JSONB,
  output_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ai_cache_type ON ai_cache(content_type);
CREATE INDEX idx_ai_cache_hash ON ai_cache(content_hash);
```

### 迁移文件
```
supabase/migrations/
├── 001_create_ai_cache.sql
└── 004_add_vocabulary_context_fields.sql
```

---

## API 集成

### 1. TechCrunch AI News API

**基础配置**:
```typescript
export const TECHCRUNCH_AI_NEWS_API = {
  baseUrl: 'http://120.79.1.150:8000',
  apiKey: 'sk-default-key-for-testing',
  defaultMaxArticles: 10,
};
```

**接口列表**:

#### GET /news/list
获取新闻列表
```bash
GET /news/list?max_articles=10&category=technology
Headers: X-API-Key: sk-default-key-for-testing
```

响应:
```json
{
  "success": true,
  "articles": [
    {
      "title": "...",
      "summary": "...",
      "url": "...",
      "published_at": "...",
      "category": "..."
    }
  ]
}
```

#### POST /news/read
生成文章音频
```bash
POST /news/read?url=<ENCODED_URL>&voice=Katerina
Headers: X-API-Key: sk-default-key-for-testing
```

响应:
```json
{
  "success": true,
  "message": "Audio generated successfully",
  "audio_file": "output_qwen_123.mp3",
  "duration_seconds": 22.56,
  "audio_size_bytes": 361004
}
```

#### GET /audio/download
下载音频文件
```bash
GET /audio/download?filename=output_qwen_123.mp3
Headers: X-API-Key: sk-default-key-for-testing
```

响应: MP3 文件流

---

### 2. 阿里云 DashScope API

**基础配置**:
```typescript
export const ALIYUN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
export const ALIYUN_WANXIANG_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
```

#### Chat Completion（单词解释）
```typescript
POST /chat/completions
Headers: 
  Authorization: Bearer ${ALIYUN_API_KEY}
  Content-Type: application/json

Body: {
  model: "qwen-plus",
  messages: [
    {
      role: "system",
      content: "You are an English teacher..."
    },
    {
      role: "user",
      content: `Explain the word "${word}" in context: "${context}"`
    }
  ]
}
```

响应格式:
```json
{
  "simpleExplanation": "...",
  "exampleSentences": ["...", "..."],
  "funMemory": "..."
}
```

#### Translation（翻译）
```typescript
POST /chat/completions
Body: {
  model: "qwen-turbo",
  messages: [
    {
      role: "user",
      content: `Translate to Chinese: ${text}`
    }
  ]
}
```

---

### 3. Supabase API

使用官方 JS SDK:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    flowType: 'implicit',
  },
});
```

**常用操作**:
```typescript
// 查询
const { data } = await supabase
  .from('vocabularies')
  .select('*')
  .eq('user_id', userId);

// 插入
const { data } = await supabase
  .from('vocabularies')
  .insert([{ word, meaning, ... }])
  .select()
  .single();

// 更新
await supabase
  .from('vocabularies')
  .update({ mastered: true })
  .eq('id', vocabId);

// 删除
await supabase
  .from('vocabularies')
  .delete()
  .eq('id', vocabId);
```

---

## UI/UX 设计规范

### 色彩系统

```typescript
// theme/colors.ts
export const colors = {
  primary: {
    DEFAULT: '#C19A6B',  // 金棕色（主色调）
    light: '#D4B896',
    dark: '#A67C52',
  },
  surface: '#FAF8F5',    // 米白色背景
  text: {
    primary: '#2C2C2C',
    secondary: '#5C5C5C',
    tertiary: '#8B8680',
  },
  border: {
    default: '#E8E4DF',
  },
};
```

### 字体规范

**英文字体**:
- 标题: Georgia, 48px, Bold
- 正文: Georgia, 30px, Regular
- 行高: 1.47

**中文字体**:
- PingFang SC (iOS)
- sans-serif (Android)
- 字号: 24px（译文）

### 间距系统

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

### 圆角规范

```typescript
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
```

### 阴影效果

```typescript
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
```

### 组件规范

#### Button 组件
```typescript
<Button
  title="提交"
  variant="primary" | "secondary" | "outline"
  size="sm" | "md" | "lg"
  loading={false}
  disabled={false}
  onPress={() => {}}
/>
```

#### Card 组件
```typescript
<Card
  title="标题"
  subtitle="副标题"
  onPress={() => {}}
>
  {children}
</Card>
```

#### Badge 组件
```typescript
<Badge
  label="Technology"
  variant="default" | "success" | "warning"
/>
```

---

## 开发规范

### 代码组织

#### 目录结构
```
ai-english-learner/
├── app/                    # Expo Router 页面
│   ├── (tabs)/            # Tab 导航页面
│   ├── article/           # 文章相关页面
│   ├── auth/              # 认证页面
│   └── _layout.tsx        # 根布局
├── components/            # 可复用组件
│   ├── ui/                # 基础 UI 组件
│   ├── article/           # 文章相关组件
│   └── stats/             # 统计组件
├── services/              # API 服务层
├── hooks/                 # 自定义 Hooks
├── store/                 # 全局状态（Zustand）
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
├── constants/             # 常量配置
├── lib/                   # 库配置（Query Client）
├── theme/                 # 主题系统
└── supabase/              # 数据库迁移
```

### 命名规范

**文件命名**:
- 组件: PascalCase.tsx (`ArticleCard.tsx`)
- Hooks: use-kebab-case.ts (`use-word.ts`)
- Services: kebab-case-service.ts (`vocabulary-service.ts`)
- Utils: kebab-case.ts (`format.ts`)

**变量命名**:
- 常量: UPPER_SNAKE_CASE (`SUPABASE_URL`)
- 变量/函数: camelCase (`userName`, `handleClick`)
- 组件: PascalCase (`ArticleDetail`)
- 类型/接口: PascalCase (`Vocabulary`, `WordDetail`)

### TypeScript 规范

**严格模式**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**类型定义**:
```typescript
// 优先使用 interface
interface Vocabulary {
  id: string;
  word: string;
}

// 联合类型
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 泛型约束
function useQuery<T>(key: string, fn: () => Promise<T>) { ... }
```

### React 规范

**组件结构**:
```typescript
export default function ComponentName() {
  // 1. Hooks 调用
  const router = useRouter();
  const { data } = useQuery(...);
  
  // 2. 状态管理
  const [loading, setLoading] = useState(false);
  
  // 3. 副作用
  useEffect(() => { ... }, []);
  
  // 4. 事件处理
  const handleClick = () => { ... };
  
  // 5. 渲染
  return <View>...</View>;
}
```

**性能优化**:
- 使用 `React.memo` 包裹纯展示组件
- 使用 `useCallback` 缓存回调函数
- 使用 `useMemo` 缓存计算结果
- 避免在 JSX 中定义内联函数

### TanStack Query 规范

**Query Key 设计**:
```typescript
// 好的做法
queryKey: ['vocabularies', userId]
queryKey: ['word-detail', word, context]

// 避免
queryKey: ['data']  // 太模糊
```

**缓存策略**:
```typescript
useQuery({
  queryKey: ['translations', text],
  queryFn: () => translate(text),
  staleTime: 7 * 24 * 60 * 60 * 1000,  // 7 天
  gcTime: 30 * 24 * 60 * 60 * 1000,     // 30 天
  retry: 1,
});
```

**Mutation 乐观更新**:
```typescript
useMutation({
  mutationFn: deleteVocabulary,
  onMutate: async (id) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries(['vocabularies']);
    
    // 保存之前的值
    const previous = queryClient.getQueryData(['vocabularies']);
    
    // 乐观更新
    queryClient.setQueryData(['vocabularies'], (old) => 
      old.filter(v => v.id !== id)
    );
    
    return { previous };
  },
  onError: (err, id, context) => {
    // 回滚
    queryClient.setQueryData(['vocabularies'], context.previous);
  },
  onSettled: () => {
    // 重新验证
    queryClient.invalidateQueries(['vocabularies']);
  },
});
```

### 错误处理

**统一错误处理**:
```typescript
try {
  await someAsyncOperation();
} catch (error: any) {
  console.error('Operation failed:', error);
  
  if (error.message?.includes('network')) {
    Alert.alert('网络错误', '请检查网络连接');
  } else {
    Alert.alert('操作失败', error.message || '请稍后重试');
  }
}
```

**日志规范**:
```typescript
// 关键操作添加日志
console.log('[ArticlePage] Loading article:', id);
console.log('[AudioService] Generated URL:', url);
console.error('[AuthService] Login failed:', error);
```

---

## 部署配置

### Netlify 部署

**配置文件**: `netlify.toml`（当前为空，使用默认配置）

**构建命令**:
```bash
npm run web
# 实际执行: expo start --web
```

**输出目录**: `dist/`

**环境变量**:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_ALIYUN_API_KEY=sk-xxx
EXPO_PUBLIC_TECHCRUNCH_API_URL=http://120.79.1.150:8000
EXPO_PUBLIC_TECHCRUNCH_API_KEY=sk-default-key-for-testing
```

**部署流程**:
1. 推送代码到 GitHub
2. Netlify 自动触发构建
3. 构建成功后自动部署
4. 访问分配的域名（如 `stellular-bonbon-f987d3.netlify.app`）

### 本地开发

**启动命令**:
```bash
npm install          # 安装依赖
npm run web          # 启动 Web 开发服务器
npm run android      # 启动 Android 模拟器
npm run ios          # 启动 iOS 模拟器
```

**环境配置**:
1. 复制 `.env.example` 为 `.env`
2. 填入实际的 API 密钥
3. 重启开发服务器

### Supabase 数据库迁移

**CLI 安装**:
```bash
brew install supabase/tap/supabase  # macOS
```

**迁移流程**:
```bash
supabase login                      # 登录
supabase link --project-ref xxx     # 关联项目
supabase db push                    # 推送迁移
```

**迁移文件位置**:
```
supabase/migrations/
├── 001_create_ai_cache.sql
└── 004_add_vocabulary_context_fields.sql
```

---

## 常见问题与解决方案

### 1. CORS 跨域问题

**症状**: 音频无法播放，控制台显示 `MEDIA_ERR_SRC_NOT_SUPPORTED`

**原因**: 服务器未配置 CORS 响应头

**解决**: 在 FastAPI 中添加 CORS 中间件（见前文）

**验证**:
```bash
curl -I "http://120.79.1.150:8000/audio/download?filename=test.mp3" \
  -H "Origin: https://your-domain.netlify.app" | grep access-control
```

应返回:
```
access-control-allow-origin: *
access-control-allow-credentials: true
```

---

### 2. HTTP/HTTPS 混合内容

**症状**: HTTPS 页面无法加载 HTTP 资源

**解决**: 使用 fetch 下载为 Blob，然后播放 Blob URL

**代码**:
```typescript
const response = await fetch(url);
const blob = await response.blob();
const blobUrl = URL.createObjectURL(blob);
audio.src = blobUrl;
```

---

### 3. TanStack Query 缓存不生效

**检查点**:
1. queryKey 是否一致
2. staleTime 设置是否合理
3. 是否调用了 `invalidateQueries`
4. 浏览器控制台 Network 标签查看请求

**调试**:
```typescript
// 启用 React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

---

### 4. AsyncStorage 容量限制

**限制**: Web 平台约 5-10MB

**解决**:
- 定期清理过期缓存
- 只缓存必要数据
- 考虑使用 IndexedDB（更大容量）

---

## 未来规划

### 短期（1-2 个月）
- [ ] 完成复习模式（SRS 算法）
- [ ] 添加学习成就系统
- [ ] 优化离线体验
- [ ] 增加更多新闻源


---

## 贡献指南

### 分支策略
- `main` - 生产环境
- `develop` - 开发环境
- `feature/*` - 新功能分支
- `bugfix/*` - Bug 修复分支

### 提交规范
```
feat: 添加单词发音功能
fix: 修复生词本删除 bug
docs: 更新 API 文档
style: 调整按钮样式
refactor: 重构认证逻辑
test: 添加单元测试
chore: 更新依赖版本
```

### Code Review 要点
- 类型安全（无 `any`）
- 错误处理完善
- 性能考虑（避免不必要的重渲染）
- 代码可读性
- 测试覆盖率

---

## 联系方式

- **项目负责人**: [待补充]
- **技术支持**: [待补充]
- **GitHub**: [待补充]
- **文档更新**: 每次重大变更后需更新本文档

---

**文档版本**: v1.0.0  
**最后更新**: 2026-04-13  
**维护者**: AI Assistant
