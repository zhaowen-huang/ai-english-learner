# Design System Migration Guide

## 从旧设计系统迁移到 Claude-inspired 设计系统

本文档指导如何将现有组件从金色主题迁移到温暖的羊皮纸主题（Claude/Anthropic 风格）。

---

## 🎨 核心变化总览

### 颜色系统变化

| 旧颜色 | 新颜色 | 用途 |
|--------|--------|------|
| `#C19A6B` (金色) | `#c96442` (Terracotta) | 主品牌色 |
| `#FAF8F5` | `#f5f4ed` (Parchment) | 页面背景 |
| `#FFFFFF` | `#faf9f5` (Ivory) | 卡片背景 |
| `#E8E4DF` | `#f0eee6` (Border Cream) | 边框颜色 |
| `#2C2C2C` | `#141413` (Near Black) | 主要文本 |
| `#5C5C5C` | `#5e5d59` (Olive Gray) | 次要文本 |
| `#8B8680` | `#87867f` (Stone Gray) | 三级文本 |

### 关键原则

✅ **必须遵守**:
1. 所有灰色必须有黄棕色底色（warm-toned）
2. 不能使用冷色调蓝灰色
3. Serif 字体只用于标题，重量固定为 500
4. 正文行高使用 1.60（文学阅读体验）
5. 使用 ring shadow (`0px 0px 0px 1px`) 代替传统阴影

❌ **禁止使用**:
1. 纯黑色 `#000000` → 使用 `#141413`
2. 纯白色背景 `#ffffff` → 使用 `#f5f4ed` 或 `#faf9f5`
3. 锐利圆角 `< 6px` → 最小使用 `comfortable: 8px`
4. 重型投影 → 使用 whisper shadow 或 ring shadow

---

## 📝 迁移步骤

### Step 1: 更新导入语句

**之前**:
```typescript
import { colors, textStyles, shadows } from '@/theme';
```

**之后** (保持不变，但可用新功能):
```typescript
import { 
  colors, 
  textStyles, 
  shadows,
  createCardStyle,
  createButtonStyle,
  createRingShadow 
} from '@/theme';
```

### Step 2: 替换颜色引用

#### 背景颜色

**之前**:
```typescript
backgroundColor: '#FAF8F5'
// 或
backgroundColor: colors.background
```

**之后**:
```typescript
backgroundColor: colors.parchment  // #f5f4ed
// 或保持别名兼容
backgroundColor: colors.background  // 仍指向 parchment
```

#### 卡片背景

**之前**:
```typescript
backgroundColor: '#FFFFFF'
```

**之后**:
```typescript
backgroundColor: colors.ivory  // #faf9f5
```

#### 文本颜色

**之前**:
```typescript
color: '#2C2C2C'  // 主要文本
color: '#5C5C5C'  // 次要文本
color: '#8B8680'  // 三级文本
```

**之后**:
```typescript
color: colors.nearBlack    // #141413
color: colors.oliveGray    // #5e5d59
color: colors.stoneGray    // #87867f

// 或使用别名
color: colors.text.primary
color: colors.text.secondary
color: colors.text.tertiary
```

#### 边框颜色

**之前**:
```typescript
borderColor: '#E8E4DF'
```

**之后**:
```typescript
borderColor: colors.borderCream  // #f0eee6
```

### Step 3: 更新按钮样式

#### 主要按钮（CTA）

**之前**:
```typescript
<TouchableOpacity
  style={{
    backgroundColor: '#C19A6B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  }}
>
  <Text style={{ color: '#FFFFFF' }}>提交</Text>
</TouchableOpacity>
```

**之后** (使用工具函数):
```typescript
import { createButtonStyle, colors } from '@/theme';

<TouchableOpacity
  style={createButtonStyle('brand', 'md')}
>
  <Text style={{ color: colors.ivory }}>提交</Text>
</TouchableOpacity>
```

**或者手动创建**:
```typescript
<TouchableOpacity
  style={{
    backgroundColor: colors.terracotta,  // #c96442
    borderRadius: 12,  // generous
    paddingVertical: 12,
    paddingHorizontal: 16,
    // Ring shadow
    borderWidth: 1,
    borderColor: colors.terracotta,
  }}
>
  <Text style={{ color: colors.ivory }}>提交</Text>
</TouchableOpacity>
```

#### 次要按钮

**之前**:
```typescript
style={{
  backgroundColor: '#F5F0EB',
  borderWidth: 1,
  borderColor: '#C19A6B',
}}
```

**之后**:
```typescript
style={createButtonStyle('sand', 'md')}
// 或
style={{
  backgroundColor: colors.sand,  // #e8e6dc
  borderRadius: 12,
  paddingLeft: 8,   // Asymmetric padding
  paddingRight: 12,
  borderWidth: 1,
  borderColor: colors.ringWarm,  // #d1cfc5
}}
```

### Step 4: 更新卡片样式

**之前**:
```typescript
<View
  style={{
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }}
>
```

**之后** (使用工具函数):
```typescript
import { createCardStyle } from '@/theme';

<View style={createCardStyle({ 
  padding: 24,
  elevated: true 
})}>
```

**或者手动创建**:
```typescript
<View
  style={{
    backgroundColor: colors.ivory,  // #faf9f5
    borderRadius: 8,  // comfortable
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderCream,  // #f0eee6
  }}
>
```

**带投影的卡片**:
```typescript
<View
  style={{
    backgroundColor: colors.ivory,
    borderRadius: 16,  // veryRounded for featured
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderCream,
    // Whisper shadow
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  }}
>
```

### Step 5: 更新文本样式

#### 标题

**之前**:
```typescript
<Text
  style={{
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    lineHeight: 58,
  }}
>
  Article Title
</Text>
```

**之后**:
```typescript
import { textStyles } from '@/theme';

<Text style={textStyles.display}>
  Article Title
</Text>

// 或 section heading
<Text style={textStyles.sectionHeading}>
  Section Title
</Text>
```

**重要**: 所有 serif 标题使用 `fontWeight: '500'` (medium)，不是 bold (700)

#### 正文

**之前**:
```typescript
<Text
  style={{
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'system-ui',
  }}
>
  Body text
</Text>
```

**之后**:
```typescript
<Text style={textStyles.bodyStandard}>
  Body text
</Text>

// 或文章段落（serif）
<Text style={textStyles.article}>
  Article paragraph content
</Text>
```

**注意**: 正文行高现在是 1.60（更宽松，文学感）

### Step 6: 更新输入框

**之前**:
```typescript
<TextInput
  style={{
    borderWidth: 1,
    borderColor: '#E8E4DF',
    borderRadius: 8,
    padding: 12,
  }}
/>
```

**之后**:
```typescript
import { createInputStyle } from '@/theme';

<TextInput
  style={createInputStyle('default')}
/>

// 聚焦状态
<TextInput
  style={createInputStyle('focused')}  // Focus Blue border
/>
```

---

## 🎯 常见场景迁移示例

### 场景 1: 文章详情页

**之前**:
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF8F5',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2C2C2C',
    fontFamily: 'Georgia',
  },
  paragraph: {
    fontSize: 30,
    color: '#3C3C3C',
    lineHeight: 44,
    fontFamily: 'Georgia',
  },
});
```

**之后**:
```typescript
import { colors, textStyles } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.parchment,  // #f5f4ed
  },
  title: {
    ...textStyles.display,
    color: colors.nearBlack,
  },
  paragraph: {
    ...textStyles.article,
    color: colors.charcoal,  // #4d4c48
  },
});
```

### 场景 2: 生词本卡片

**之前**:
```typescript
<Card
  style={{
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  }}
>
  <Text style={{ color: '#2C2C2C', fontWeight: 'bold' }}>
    {word}
  </Text>
  <Text style={{ color: '#5C5C5C' }}>
    {meaning}
  </Text>
</Card>
```

**之后**:
```typescript
import { createCardStyle, colors, textStyles } from '@/theme';

<Card
  style={createCardStyle({ 
    padding: 24,
    variant: 'default'
  })}
>
  <Text style={{ 
    ...textStyles.subHeading,
    color: colors.nearBlack 
  }}>
    {word}
  </Text>
  <Text style={{ 
    ...textStyles.bodyStandard,
    color: colors.oliveGray 
  }}>
    {meaning}
  </Text>
</Card>
```

### 场景 3: 导航栏

**之前**:
```typescript
<View
  style={{
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DF',
  }}
>
  <Text style={{ color: '#2C2C2C' }}>Logo</Text>
</View>
```

**之后**:
```typescript
<View
  style={{
    backgroundColor: colors.parchment,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,  // #30302e (dark border for nav)
  }}
>
  <Text style={{ 
    color: colors.nearBlack,
    ...textStyles.nav 
  }}>
    Logo
  </Text>
</View>
```

---

## 🔧 自动化迁移脚本（可选）

对于大型项目，可以编写 codemod 脚本自动替换颜色值：

```javascript
// 示例：查找并替换颜色
const colorMap = {
  '#FAF8F5': 'colors.parchment',
  '#FFFFFF': 'colors.ivory',
  '#2C2C2C': 'colors.nearBlack',
  '#5C5C5C': 'colors.oliveGray',
  '#8B8680': 'colors.stoneGray',
  '#E8E4DF': 'colors.borderCream',
  '#C19A6B': 'colors.terracotta',
};
```

---

## ✅ 迁移检查清单

- [ ] 所有背景色更新为 Parchment (`#f5f4ed`) 或 Ivory (`#faf9f5`)
- [ ] 所有文本颜色更新为暖色调灰色
- [ ] 所有边框颜色更新为 Border Cream (`#f0eee6`)
- [ ] 按钮使用 Terracotta (`#c96442`) 作为主要 CTA
- [ ] 标题字体重量改为 500 (medium)，不是 700 (bold)
- [ ] 正文字行高增加到 1.60
- [ ] 圆角至少使用 8px (comfortable)
- [ ] 移除重型投影，改用 ring shadow 或 whisper shadow
- [ ] 测试暗色模式（如需要）
- [ ] 验证无障碍对比度

---

## 🎨 设计原则提醒

### Do's ✅

1. **使用 Parchment 作为主背景** - 这是 Claude 的灵魂
2. **Serif 标题只用 weight 500** - 保持一致性
3. **Terracotta 仅用于主要 CTA** - 最高信号品牌时刻
4. **所有中性色必须是暖色调** - 不能有冷蓝灰
5. **使用 ring shadow 进行交互** - 而不是传统投影
6. **保持 serif/sans 层次** - serif 内容标题，sans UI
7. **使用宽松的正文行高 (1.60)** - 文学阅读体验
8. **交替使用明暗区域** - 创造章节般的节奏
9. **应用 generous border-radius (12-32px)** - 柔和友好感

### Don'ts ❌

1. **不要使用冷蓝灰色** - 调色板完全是暖色调
2. **不要在 Serif 上使用 bold (700+)** - weight 500 是上限
3. **不要引入饱和色彩** - 除了 Terracotta，保持柔和
4. **不要使用锐利圆角 (< 6px)** - 柔和是核心身份
5. **不要应用重型投影** - 深度来自 ring shadow 和背景色变化
6. **不要用纯白作为页面背景** - Parchment 或 Ivory 总是更温暖
7. **不要使用几何/科技风格插图** - Claude 的插图是有机的、手绘感的
8. **不要减少正文字行高到 1.40 以下** - 宽松间距支持编辑个性
9. **不要在非代码内容中使用等宽字体** - Anthropic Mono 严格用于代码
10. **不要在标题中混用 sans-serif** - serif/sans 分割是排版身份

---

## 📚 参考资源

- [DESIGN.md](./DESIGN.md) - 完整设计规范
- [PROJECT_FEATURES.md](./PROJECT_FEATURES.md) - 项目功能文档
- [theme/colors.ts](./theme/colors.ts) - 颜色定义
- [theme/typography.ts](./theme/typography.ts) - 字体系统
- [theme/shadows.ts](./theme/shadows.ts) - 阴影系统

---

**最后更新**: 2026-04-13  
**维护者**: AI Assistant
