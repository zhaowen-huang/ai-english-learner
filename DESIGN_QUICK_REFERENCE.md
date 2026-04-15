# Claude Design System - Quick Reference Card

## 🎨 Colors

### Backgrounds
```typescript
colors.parchment    // #f5f4ed - Main page background
colors.ivory        // #faf9f5 - Cards, containers
colors.white        // #ffffff - Buttons only
colors.sand         // #e8e6dc - Button backgrounds
colors.darkSurface  // #30302e - Dark theme
```

### Text
```typescript
colors.nearBlack    // #141413 - Primary text
colors.oliveGray    // #5e5d59 - Secondary text
colors.stoneGray    // #87867f - Tertiary text
colors.silver       // #b0aea5 - Text on dark surfaces
```

### Brand & Accent
```typescript
colors.terracotta   // #c96442 - PRIMARY CTA (brand color)
colors.coral        // #d97757 - Light accent
colors.error        // #b53333 - Error states
colors.focusBlue    // #3898ec - Focus rings (ONLY cool color)
```

### Borders
```typescript
colors.borderCream  // #f0eee6 - Standard borders
colors.borderWarm   // #e8e6dc - Prominent borders
colors.borderDark   // #30302e - Dark theme borders
```

---

## 🔤 Typography

### Headlines (ALL Serif, Weight 500)
```typescript
textStyles.display           // 64px - Hero titles
textStyles.sectionHeading    // 52px - Section titles
textStyles.subHeading        // 32px - Card titles
textStyles.featureTitle      // 20.8px - Small features
```

### Body Text
```typescript
textStyles.bodySerif         // 17px, serif - Editorial content
textStyles.bodyLarge         // 20px, sans - Intro paragraphs
textStyles.bodyStandard      // 16px, sans - Standard body
textStyles.bodySmall         // 15px, sans - Compact text
textStyles.article           // 30px, serif - Article paragraphs
```

### UI Text
```typescript
textStyles.nav               // 17px - Navigation
textStyles.caption           // 14px - Metadata
textStyles.label             // 12px - Badges
textStyles.button            // 16px - Button text
```

**Key Rule**: All serif headings use `fontWeight: '500'` ONLY (no bold!)

---

## 📐 Spacing & Radius

### Spacing (Base: 8px)
```typescript
spacing[2]   // 8px
spacing[4]   // 16px
spacing[6]   // 24px - Card padding
spacing[8]   // 32px - Section spacing
```

### Border Radius
```typescript
borderRadius.comfortable  // 8px - Standard (MOST COMMON)
borderRadius.generous     // 12px - Buttons, inputs
borderRadius.veryRounded  // 16px - Featured cards
borderRadius.maximum      // 32px - Hero containers
```

---

## 🌟 Shadows

### Ring Shadows (Claude's Signature)
```typescript
import { createRingShadow, colors } from '@/theme';

// Interactive elements
createRingShadow(colors.ringWarm, 1)

// Active/pressed states
createRingShadow(colors.ringDeep, 1)
```

### Elevation Levels
```typescript
shadows.flat       // Level 0: No shadow/border
shadows.contained  // Level 1: 1px border
shadows.whisper    // Level 3: Soft shadow (0.05 opacity, 24px blur)
```

---

## 🛠️ Utility Functions

### Cards
```typescript
import { createCardStyle } from '@/theme';

// Standard card
createCardStyle({ padding: 24 })

// Featured card with elevation
createCardStyle({ 
  padding: 24, 
  variant: 'featured',
  elevated: true 
})

// Hero container
createCardStyle({ 
  variant: 'hero',
  padding: 32 
})
```

### Buttons
```typescript
import { createButtonStyle } from '@/theme';

// Primary CTA (Terracotta)
createButtonStyle('brand', 'md')

// Secondary (Warm Sand)
createButtonStyle('sand', 'md')

// Elevated white
createButtonStyle('white', 'lg')

// Dark theme
createButtonStyle('dark', 'sm')

// Outline
createButtonStyle('outline', 'md')
```

### Inputs
```typescript
import { createInputStyle } from '@/theme';

createInputStyle('default')   // Cream border
createInputStyle('focused')   // Blue border (accessibility)
createInputStyle('error')     // Red border
```

---

## 📋 Common Patterns

### Article Page
```typescript
<View style={{ backgroundColor: colors.parchment }}>
  <Text style={{
    ...textStyles.display,
    color: colors.nearBlack,
  }}>
    Article Title
  </Text>
  
  <Text style={{
    ...textStyles.article,
    color: colors.charcoal,
  }}>
    Article content...
  </Text>
</View>
```

### Card Component
```typescript
<View style={createCardStyle({ 
  padding: 24,
  elevated: true 
})}>
  <Text style={{
    ...textStyles.subHeading,
    color: colors.nearBlack,
  }}>
    Card Title
  </Text>
  <Text style={{
    ...textStyles.bodyStandard,
    color: colors.oliveGray,
  }}>
    Description...
  </Text>
</View>
```

### Button Group
```typescript
<View style={{ gap: 12 }}>
  <TouchableOpacity style={createButtonStyle('brand', 'lg')}>
    <Text style={{ color: colors.ivory, ...textStyles.button }}>
      Primary Action
    </Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={createButtonStyle('sand', 'lg')}>
    <Text style={{ color: colors.charcoal, ...textStyles.button }}>
      Secondary
    </Text>
  </TouchableOpacity>
</View>
```

### Form Input
```typescript
const [focused, setFocused] = useState(false);

<TextInput
  style={[
    createInputStyle(focused ? 'focused' : 'default'),
    textStyles.bodyStandard,
    { color: colors.nearBlack }
  ]}
  placeholder="Enter text..."
  placeholderTextColor={colors.stoneGray}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>
```

---

## ⚠️ Important Rules

### DO ✅
- Use `colors.parchment` for page backgrounds
- Use serif (Georgia) for ALL headlines at weight 500
- Use `colors.terracotta` ONLY for primary CTAs
- Keep all neutrals warm-toned
- Use ring shadows for interactive states
- Maintain generous line-height (1.60) for body text
- Use minimum 8px border radius

### DON'T ❌
- Don't use cool blue-grays (except Focus Blue)
- Don't use bold (700+) on serif fonts
- Don't introduce saturated colors beyond Terracotta
- Don't use sharp corners (< 6px)
- Don't apply heavy drop shadows
- Don't use pure white as page background
- Don't reduce body line-height below 1.40

---

## 🎯 Color Palette Visual

```
Backgrounds:
  Parchment  █ #f5f4ed  (main bg)
  Ivory      █ #faf9f5  (cards)
  Sand       █ #e8e6dc  (buttons)

Text:
  Near Black █ #141413  (primary)
  Olive Gray █ #5e5d59  (secondary)
  Stone Gray █ #87867f  (tertiary)

Brand:
  Terracotta █ #c96442  (PRIMARY CTA)
  Coral      █ #d97757  (accent)

Borders:
  Cream      █ #f0eee6  (standard)
  Warm       █ #e8e6dc  (prominent)

Semantic:
  Error      █ #b53333  (errors)
  Focus Blue █ #3898ec  (focus rings - ONLY cool color)
```

---

## 📖 Full Documentation

- [DESIGN.md](./DESIGN.md) - Complete design system specification
- [DESIGN_MIGRATION_GUIDE.md](./DESIGN_MIGRATION_GUIDE.md) - Migration guide
- [DESIGN_SYSTEM_SUMMARY.md](./DESIGN_SYSTEM_SUMMARY.md) - Implementation summary

---

**Last Updated**: 2026-04-13  
**Version**: 2.0.0
