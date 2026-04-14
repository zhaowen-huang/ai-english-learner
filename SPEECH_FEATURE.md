# 单词发音功能说明

## 功能概述

为英语学习应用添加了单词发音功能，用户可以在生词本列表和单词详情页点击发音按钮听取单词的标准英语发音。

## 实现内容

### 1. 语音服务模块

**文件**: `services/speech-service.ts`

提供了基于 Web Speech API 的语音合成功能：
- `speakWord()`: 播放单词发音
- `stopSpeaking()`: 停止当前发音
- `isSpeechSupported()`: 检查浏览器是否支持语音合成

### 2. 语音 Hook

**文件**: `hooks/use-speech.ts`

封装了语音功能的 React Hook，提供：
- `speak(word)`: 播放指定单词的发音
- `stop()`: 停止发音
- `isSpeaking`: 当前是否正在发音的状态
- `isSupported`: 浏览器是否支持语音合成

特性：
- 自动管理发音状态
- 支持重复点击切换播放/停止
- 错误处理和日志记录
- 可配置的语速、音调和语言

### 3. 单词详情页发音按钮

**文件**: `app/word/[word].tsx`

在单词标题旁边添加了发音按钮：
- 使用音量图标表示发音功能
- 发音时图标变为高音量并改变颜色
- 点击即可播放/停止发音
- 优雅的视觉反馈

### 4. 生词本列表发音功能

**文件**: `app/(tabs)/vocabulary.tsx`

在每个单词卡片中添加了发音按钮：
- 位于单词名称旁边
- 使用 emoji 图标（🔉/🔊）表示状态
- 发音时图标会变化
- 不影响卡片的点击跳转功能

## 技术细节

### Web Speech API

使用浏览器原生的 Web Speech API（SpeechSynthesis）：
- 无需额外的音频文件
- 支持离线使用
- 自动选择系统语音引擎
- 良好的跨平台兼容性

### 配置参数

```typescript
const options = {
  lang: 'en-US',     // 语言设置
  rate: 0.9,         // 语速 (0.1 - 10)
  pitch: 1,          // 音调 (0 - 2)
};
```

### 状态管理

- 使用 `useState` 管理发音状态
- 使用 `useRef` 跟踪当前语音实例
- 自动清理和状态重置

## 使用方法

### 在组件中使用

```tsx
import { useSpeech } from '@/hooks/use-speech';

function MyComponent() {
  const { speak, isSpeaking } = useSpeech();
  
  return (
    <TouchableOpacity onPress={() => speak('hello')}>
      <Text>{isSpeaking ? '🔊' : '🔉'} Play</Text>
    </TouchableOpacity>
  );
}
```

### 自定义配置

```tsx
const { speak } = useSpeech({
  lang: 'en-GB',     // 英式英语
  rate: 0.8,         // 较慢语速
  pitch: 1.2,        // 稍高音调
});
```

## 浏览器兼容性

Web Speech API 在现代浏览器中有良好的支持：

- ✅ Chrome/Edge (完全支持)
- ✅ Safari (iOS/macOS 完全支持)
- ✅ Firefox (部分支持)
- ⚠️ 旧版浏览器可能不支持

## 注意事项

1. **首次使用**: 某些浏览器可能在首次使用时请求权限
2. **离线使用**: Web Speech API 通常可以离线工作
3. **性能**: 同时只能播放一个语音实例
4. **移动端**: 在移动设备上可能需要用户交互才能触发

## 未来优化方向

- [ ] 添加美式/英式英语切换
- [ ] 支持句子朗读
- [ ] 添加发音历史记录
- [ ] 支持慢速/正常/快速三种模式
- [ ] 添加波形动画效果
