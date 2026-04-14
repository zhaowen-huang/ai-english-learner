/**
 * 设计令牌 - 字体系统
 */

import { Platform } from 'react-native';

// 字体族
export const fontFamily = {
  // 英文衬线字体（用于标题和正文）
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),

  // 英文无衬线字体（用于UI元素）
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui',
  }),

  // 中文字体
  chinese: Platform.select({
    ios: 'PingFang SC',
    android: 'sans-serif',
    default: 'sans-serif',
  }),

  // 等宽字体（用于代码）
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// 字号
export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 28,
  '4xl': 36,
  '5xl': 48,
};

// 字重
export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// 行高
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// 预定义的文本样式
export const textStyles = {
  // 标题样式
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    fontFamily: fontFamily.serif,
  },

  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    fontFamily: fontFamily.serif,
  },

  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    fontFamily: fontFamily.serif,
  },

  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },

  // 正文字体样式
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.relaxed,
    fontFamily: fontFamily.sans,
  },

  bodyLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * lineHeight.relaxed,
    fontFamily: fontFamily.sans,
  },

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },

  // 文章段落样式
  article: {
    fontSize: 30,
    fontWeight: fontWeight.normal,
    lineHeight: 44,
    fontFamily: fontFamily.serif,
  },

  // 辅助文本样式
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },

  // 按钮文本样式
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },

  buttonSmall: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.base * lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
};
