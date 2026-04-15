/**
 * Shadow & Elevation System - Inspired by Claude (Anthropic)
 * 
 * Philosophy:
 * - Depth through warm-toned RING SHADOWS rather than traditional drop shadows
 * - Signature pattern: 0px 0px 0px 1px (shadow pretending to be a border)
 * - When drop shadows appear, they're extremely soft (0.05 opacity, 24px blur)
 * - Light/Dark alternation creates dramatic depth by changing ambient light
 */

import { Platform } from 'react-native';
import { colors } from './colors';

// ==========================================
// Ring Shadow System (Claude's Signature)
// ==========================================

/**
 * Ring Shadow Helper
 * Creates the signature 0px 0px 0px 1px pattern
 * This is a shadow that pretends to be a border
 */
export const createRingShadow = (color: string, width: number = 1) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 0,
  // Note: React Native doesn't support ring shadows natively
  // Use borderWidth + borderColor as fallback
  borderWidth: Platform.OS === 'web' ? 0 : width,
  borderColor: Platform.OS === 'web' ? 'transparent' : color,
});

// ==========================================
// Elevation Levels
// Based on DESIGN.md depth system
// ==========================================

export const shadows = {
  /**
   * Level 0 - Flat
   * No shadow, no border
   * Parchment background, inline text
   */
  flat: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /**
   * Level 1 - Contained
   * Thin solid border
   * Standard cards, sections
   */
  contained: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Use borderWidth for containment
    borderWidth: 1,
    borderColor: colors.borderCream,
  },

  /**
   * Level 2 - Ring Shadow
   * Interactive cards, buttons, hover states
   * The signature Claude pattern
   */
  ring: createRingShadow(colors.ringWarm, 1),

  /**
   * Level 2 Variant - Subtle Ring
   * For lighter interactive surfaces
   */
  ringSubtle: createRingShadow(colors.ringSubtle, 1),

  /**
   * Level 2 Variant - Deep Ring
   * Active/pressed states
   */
  ringDeep: createRingShadow(colors.ringDeep, 1),

  /**
   * Level 3 - Whisper Shadow
   * Elevated feature cards, product screenshots
   * Extremely soft: 0.05 opacity, 24px blur
   */
  whisper: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },

  /**
   * Level 4 - Inset Shadow
   * Active/pressed button states
   * 15% opacity inset
   */
  inset: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    // Simulate inset with inner border
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },

  // ==========================================
  // Legacy Aliases (for backward compatibility)
  // Mapped to new system
  // ==========================================
  
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },

  md: {
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },

  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },

  xl: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },

  '2xl': {
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ==========================================
// Border Radius Scale
// Based on DESIGN.md radius system
// ==========================================

export const borderRadius = {
  /**
   * Sharp (4px)
   * Minimal inline elements
   */
  sharp: 4,
  
  /**
   * Subtly Rounded (6-7.5px)
   * Small buttons, secondary interactive elements
   */
  subtle: 6,
  
  /**
   * Comfortably Rounded (8-8.5px)
   * Standard buttons, cards, containers
   * THE MOST COMMON radius in Claude's design
   */
  comfortable: 8,
  
  /**
   * Generously Rounded (12px)
   * Primary buttons, input fields, nav elements
   */
  generous: 12,
  
  /**
   * Very Rounded (16px)
   * Featured containers, video players, tab lists
   */
  veryRounded: 16,
  
  /**
   * Highly Rounded (24px)
   * Tag-like elements, highlighted containers
   */
  highlyRounded: 24,
  
  /**
   * Maximum Rounded (32px)
   * Hero containers, embedded media, large cards
   */
  maximum: 32,
  
  /**
   * Full Circle
   * Avatars, circular buttons
   */
  full: 9999,

  // Legacy aliases
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
};

// ==========================================
// Spacing System
// Base unit: 8px
// ==========================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

// ==========================================
// Animation Duration
// ==========================================

export const animationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// ==========================================
// Z-index Layers
// ==========================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 1000,
};
