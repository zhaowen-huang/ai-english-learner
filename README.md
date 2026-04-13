# AI English Learner - React Native 应用

一个基于 React Native + Expo 构建的跨平台英语阅读学习应用，支持 iOS 和 Android。

## 功能特性

- ✅ 用户认证系统（注册/登录）
- ✅ 分级阅读文章（初级/中级/高级）
- ✅ 文章阅读器（支持单词长按查词）
- ✅ 生词本管理
- ✅ 学习进度追踪
- ✅ 学习统计数据
- ✅ 离线优先设计

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **导航**: Expo Router
- **状态管理**: Zustand
- **后端服务**: Supabase
- **样式**: NativeWind (Tailwind CSS)
- **本地存储**: AsyncStorage

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

在 `constants/config.ts` 中替换为你的 Supabase 凭证：

```typescript
export const SUPABASE_URL = 'your-supabase-url';
export const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### 3. 设置 Supabase 数据库

在 Supabase 项目中执行以下 SQL 创建表：

```sql
-- 文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  category TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  estimated_time INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生词表
CREATE TABLE vocabularies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  article_id UUID REFERENCES articles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_review_at TIMESTAMP WITH TIME ZONE,
  mastered BOOLEAN DEFAULT FALSE
);

-- 阅读进度表
CREATE TABLE reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- 启用 RLS (Row Level Security)
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own vocabularies"
  ON vocabularies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabularies"
  ON vocabularies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabularies"
  ON vocabularies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabularies"
  ON vocabularies FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4. 添加示例文章数据

```sql
INSERT INTO articles (title, content, difficulty, category, word_count, estimated_time) VALUES
('The Benefits of Reading', 'Reading is one of the most beneficial activities you can engage in. It improves your vocabulary, enhances your knowledge, and stimulates your imagination. Regular reading can also reduce stress and improve your focus and concentration.', 'beginner', 'Education', 150, 3),
('Technology in Modern Life', 'Technology has become an integral part of our daily lives. From smartphones to artificial intelligence, technological advancements have transformed how we communicate, work, and live.', 'intermediate', 'Technology', 300, 5),
('Climate Change and Sustainability', 'Climate change represents one of the most pressing challenges facing humanity today. The scientific consensus is clear: human activities are causing global temperatures to rise.', 'advanced', 'Environment', 500, 8);
```

### 5. 运行应用

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 项目结构

```
ai-english-learner/
├── app/                    # 页面路由 (Expo Router)
│   ├── (tabs)/            # 底部标签页
│   ├── article/           # 文章详情页
│   ├── auth/              # 认证页面
│   └── _layout.tsx        # 根布局
├── components/            # UI 组件
├── services/              # API 服务
├── store/                 # 状态管理
├── hooks/                 # 自定义 Hooks
├── types/                 # TypeScript 类型
├── constants/             # 常量配置
└── utils/                 # 工具函数
```

## 主要功能说明

### 用户认证
- 使用 Supabase Auth 进行邮箱/密码认证
- 自动 Token 刷新
- 持久化登录状态

### 文章阅读
- 按难度分级浏览
- 下拉刷新
- 阅读进度自动保存
- 单词长按添加到生词本

### 生词本
- 从文章中快速添加生词
- 标记掌握状态
- 复习次数统计
- 删除和管理生词

### 学习统计
- 已完成文章数量
- 总阅读时长
- 学习天数
- 周/月目标进度

## 开发注意事项

1. **Supabase 配置**: 确保正确配置 Supabase URL 和密钥
2. **环境变量**: 生产环境建议使用环境变量管理敏感信息
3. **离线支持**: 应用采用离线优先设计，数据会先保存到本地再同步到云端
4. **错误处理**: 当 Supabase 未配置时，应用会使用示例数据正常运行

## 后续优化方向

- [ ] 添加真实的词典 API 集成
- [ ] 实现推送通知提醒复习
- [ ] 添加听力练习功能
- [ ] 社交分享功能
- [ ] 成就系统
- [ ] 深色模式支持

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
