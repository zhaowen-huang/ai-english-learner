/**
 * 设计令牌 - 颜色系统
 * 基于优雅、专业的英语学习应用主题
 */

export const colors = {
  // 主色调 - 温暖的金色
  primary: {
    DEFAULT: '#C19A6B',
    light: '#D4AF8A',
    dark: '#A67C52',
    lighter: '#E8D5C0',
    darker: '#8B6F4E',
  },

  // 中性色 - 温暖的灰色系
  neutral: {
    50: '#FAF8F5',   // 背景色
    100: '#F5F0EB',  // 卡片背景
    200: '#E8E4DF',  // 边框
    300: '#D4CFC9',  // 禁用边框
    400: '#C4C0BA',  // 分隔线
    500: '#8B8680',  // 次要文本
    600: '#5C5C5C',  // 正文文本
    700: '#3C3C3C',  // 主要文本
    800: '#2C2C2C',  // 标题/强调
    900: '#1A1A1A',  // 最深色
  },

  // 语义色
  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    dark: '#059669',
    lighter: '#D1FAE5',
  },

  error: {
    DEFAULT: '#E74C3C',
    light: '#F87171',
    dark: '#DC2626',
    lighter: '#FEE2E2',
  },

  warning: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    lighter: '#FEF3C7',
  },

  info: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    lighter: '#DBEAFE',
  },

  // 功能色
  background: '#FAF8F5',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // 文字颜色别名
  text: {
    primary: '#2C2C2C',
    secondary: '#5C5C5C',
    tertiary: '#8B8680',
    disabled: '#C4C0BA',
    inverse: '#FFFFFF',
  },

  // 边框颜色别名
  border: {
    default: '#E8E4DF',
    focus: '#C19A6B',
    error: '#E74C3C',
    success: '#10B981',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type PrimaryColorKey = keyof typeof colors.primary;
export type NeutralColorKey = keyof typeof colors.neutral;
