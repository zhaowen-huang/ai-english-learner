/**
 * 主题系统 - 统一导出
 */

export { colors } from './colors';
export { fontFamily, fontSize, fontWeight, lineHeight, textStyles } from './typography';
export { shadows, borderRadius, spacing, animationDuration, zIndex } from './shadows';

// 便捷的工具函数
import { colors } from './colors';
import { shadows } from './shadows';
import { borderRadius } from './shadows';

/**
 * 获取平台特定的样式（处理 iOS 和 Android 的阴影差异）
 */
export function getPlatformShadow(shadow: typeof shadows.md) {
  if (shadow === shadows.none) {
    return {};
  }
  
  return shadow;
}

/**
 * 创建卡片样式
 */
export function createCardStyle(options?: {
  padding?: number;
  rounded?: keyof typeof borderRadius;
  shadow?: keyof typeof shadows;
}) {
  const { 
    padding = 16, 
    rounded = 'lg', 
    shadow = 'md' 
  } = options || {};

  return {
    backgroundColor: colors.surface,
    borderRadius: borderRadius[rounded],
    padding,
    ...shadows[shadow],
  };
}

/**
 * 创建按钮样式
 */
export function createButtonStyle(variant: 'primary' | 'secondary' | 'outline' | 'ghost') {
  const baseStyle = {
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.primary.DEFAULT,
        ...shadows.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.neutral[100],
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary.DEFAULT,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    default:
      return baseStyle;
  }
}
