# 难词识别功能说明

## 功能概述

在文章详情页添加了"识别难词"功能，可以自动分析文章内容，提炼出5岁小孩可能看不懂的单词。

## 实现细节

### 1. 核心功能

- **智能识别**：使用阿里云 LLM (qwen-flash) 分析文章内容
- **年龄适配**：专门针对5岁儿童的词汇水平进行识别
- **数量限制**：最多返回20个难词，避免信息过载
- **交互友好**：点击难词可查看详细释义

### 2. 技术实现

#### 状态管理
```typescript
const [difficultWords, setDifficultWords] = useState<string[]>([]);
const [loadingDifficultWords, setLoadingDifficultWords] = useState(false);
const [showDifficultWords, setShowDifficultWords] = useState(false);
```

#### AI 调用
- 使用阿里云 DashScope API
- 模型：qwen-flash
- Prompt 设计：明确要求识别5岁儿童难以理解的单词
- 结果解析：自动清理、去重、限制数量

#### UI 组件
- **按钮位置**：顶部导航栏，与"显示译文"按钮并列
- **按钮状态**：
  - 默认：灰色背景，显示"识别难词"
  - 加载中：绿色背景，显示"分析中..." + loading 动画
  - 已完成：橙色背景，显示"难词 (数量)"
- **列表展示**：
  - 卡片式设计，带阴影和边框
  - 黄色主题色（#F59E0B）
  - 可关闭的弹窗式列表
  - 每个单词可点击查看详情

### 3. 用户体验流程

1. **打开文章** → 阅读原文
2. **点击"识别难词"** → 后台调用 AI 分析
3. **等待分析完成** → 按钮显示 loading 状态
4. **查看难词列表** → 橙色高亮显示所有难词
5. **点击任意难词** → 弹出单词卡片查看详细释义
6. **关闭列表** → 点击右上角 ✕ 按钮

### 4. 样式设计

#### 难词按钮
- 未激活：浅灰背景 (#F1F5F9)
- 已激活：橙色背景 (#F59E0B)
- 圆角：12px
- 最小宽度：100px

#### 难词列表容器
- 白色背景
- 橙色边框 (#F59E0B)
- 圆角：16px
- 阴影效果
- 内边距：16px

#### 单个难词标签
- 浅黄背景 (#FEF3C7)
- 橙色边框 (#F59E0B)
- 深棕文字 (#92400E)
- 圆角：8px
- 内边距：8px 12px

### 5. 性能优化

- **缓存机制**：识别过的难词会保存在状态中，不会重复调用 API
- **异步处理**：AI 调用不阻塞 UI，用户可以继续滚动阅读
- **数量限制**：最多20个单词，控制渲染性能

### 6. 错误处理

- API 调用失败时显示 Alert 提示
- 网络错误时给出友好提示："提取难词失败，请稍后重试"
- 控制台记录详细错误日志便于调试

## 代码位置

- **主文件**：`/app/article/[id].tsx`
- **核心函数**：
  - `extractDifficultWords()` - 提取难词
  - `handleDifficultWordPress()` - 点击难词处理
- **UI 组件**：
  - 难词按钮（第569-589行）
  - 难词列表（第683-707行）
- **样式定义**：
  - `difficultWordsButton` (第919-930行)
  - `difficultWordsButtonActive` (第931-934行)
  - `difficultWordsContainer` (第1076-1090行)
  - `difficultWordsHeader` (第1091-1096行)
  - `difficultWordsTitle` (第1097-1101行)
  - `difficultWordsCloseButton` (第1102-1108行)
  - `difficultWordsCloseText` (第1109-1113行)
  - `difficultWordsList` (第1114-1118行)
  - `difficultWordItem` (第1119-1125行)
  - `difficultWordText` (第1126-1130行)

## 后续优化建议

1. **环境变量**：将 API Key 移到环境变量中
2. **持久化缓存**：将识别结果保存到 AsyncStorage，避免重复调用
3. **难度分级**：支持不同年龄段（3岁、5岁、8岁等）
4. **发音功能**：难词列表中直接添加发音按钮
5. **收藏功能**：一键将所有难词添加到生词本
6. **统计功能**：显示文章的词汇难度评分

## 注意事项

⚠️ **安全提醒**：当前 API Key 是硬编码在代码中的，建议：
- 创建 `.env` 文件存储敏感信息
- 使用 `react-native-dotenv` 或 Expo 的环境变量功能
- 不要将包含真实 API Key 的代码提交到公开仓库
