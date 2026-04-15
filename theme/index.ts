/**
 * Theme System - Unified Export
 * Inspired by Claude (Anthropic) Design System
 */

export { colors } from './colors';
export { 
  fontFamily, 
  fontSize, 
  fontWeight, 
  lineHeight, 
  letterSpacing,
  textStyles 
} from './typography';
export { 
  shadows, 
  createRingShadow,
  borderRadius, 
  spacing, 
  animationDuration, 
  zIndex 
} from './shadows';

// ==========================================
// Utility Functions
// ==========================================

import { colors } from './colors';
import { shadows, createRingShadow, borderRadius } from './shadows';
import { Platform } from 'react-native';

/**
 * Get platform-specific shadow styles
 * Handles iOS vs Android shadow differences
 */
export function getPlatformShadow(shadow: any) {
  if (!shadow || shadow === shadows.flat) {
    return {};
  }
  
  return shadow;
}

/**
 * Create card style following Claude's design principles
 * - Ivory or White background
 * - Border Cream border (1px)
 * - Comfortably rounded corners (8px)
 * - Optional whisper shadow for elevation
 */
export function createCardStyle(options?: {
  padding?: number;
  rounded?: keyof typeof borderRadius;
  elevated?: boolean;
  variant?: 'default' | 'featured' | 'hero';
}) {
  const { 
    padding = 24, 
    rounded = 'comfortable',
    elevated = false,
    variant = 'default'
  } = options || {};

  // Determine background and border based on variant
  let backgroundColor: string = colors.ivory;
  let borderColor = colors.borderCream;
  let radius = borderRadius[rounded];
  let shadowStyle = {};

  if (variant === 'featured') {
    radius = borderRadius.veryRounded; // 16px
    if (elevated) {
      shadowStyle = shadows.whisper;
    }
  } else if (variant === 'hero') {
    radius = borderRadius.maximum; // 32px
    backgroundColor = colors.white;
  } else {
    // Default variant
    if (elevated) {
      shadowStyle = shadows.contained;
    }
  }

  return {
    backgroundColor,
    borderRadius: radius,
    padding,
    borderWidth: 1,
    borderColor,
    ...shadowStyle,
  };
}

/**
 * Create button style following Claude's design principles
 * 
 * Variants:
 * - brand: Terracotta background (#c96442) - Primary CTA
 * - sand: Warm Sand background (#e8e6dc) - Secondary
 * - white: Pure White background - Elevated on light surfaces
 * - dark: Dark Surface background (#30302e) - Dark theme
 * - outline: Transparent with border
 */
export function createButtonStyle(
  variant: 'brand' | 'sand' | 'white' | 'dark' | 'outline',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  // Size presets
  const sizePresets = {
    sm: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: 17,
    },
  };

  const sizeStyle = sizePresets[size];
  const baseStyle = {
    borderRadius: borderRadius.generous, // 12px
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...sizeStyle,
  };

  switch (variant) {
    case 'brand':
      // Terracotta Brand button - Primary CTA
      return {
        ...baseStyle,
        backgroundColor: colors.terracotta,
        ...createRingShadow(colors.terracotta, 1),
      };
    
    case 'sand':
      // Warm Sand button - Secondary
      // Asymmetric padding: 0px 12px 0px 8px (icon-first layout)
      return {
        ...baseStyle,
        backgroundColor: colors.sand,
        paddingLeft: 8,
        paddingRight: 12,
        ...createRingShadow(colors.ringWarm, 1),
      };
    
    case 'white':
      // White Surface button - Clean, elevated
      return {
        ...baseStyle,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderCream,
      };
    
    case 'dark':
      // Dark Charcoal button - For dark theme surfaces
      return {
        ...baseStyle,
        backgroundColor: colors.darkSurface,
        ...createRingShadow(colors.borderDark, 1),
      };
    
    case 'outline':
      // Outline button - Minimal
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.borderWarm,
      };
    
    default:
      return baseStyle;
  }
}

/**
 * Create input field style
 * - Generously rounded (12px)
 * - Compact vertical padding
 * - Focus ring with Focus Blue (accessibility)
 */
export function createInputStyle(state: 'default' | 'focused' | 'error' = 'default') {
  const baseStyle = {
    borderRadius: borderRadius.generous, // 12px
    paddingHorizontal: 12,
    paddingVertical: 1.6, // Very compact vertical
    backgroundColor: colors.white,
    borderWidth: 1,
  };

  switch (state) {
    case 'focused':
      return {
        ...baseStyle,
        borderColor: colors.focusBlue, // The ONLY cool color
      };
    
    case 'error':
      return {
        ...baseStyle,
        borderColor: colors.error,
      };
    
    default:
      return {
        ...baseStyle,
        borderColor: colors.borderCream,
      };
  }
}

/**
 * Get text color based on hierarchy
 */
export function getTextColor(hierarchy: 'primary' | 'secondary' | 'tertiary' | 'disabled') {
  return colors.text[hierarchy];
}

/**
 * Check if a color is warm-toned (Claude principle)
 * Returns false for cool colors like Focus Blue
 */
export function isWarmColor(color: string): boolean {
  const coolColors: string[] = [colors.focusBlue];
  return !coolColors.includes(color);
}
