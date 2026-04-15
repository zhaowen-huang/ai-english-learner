/**
 * Typography System - Inspired by Claude (Anthropic)
 * 
 * Principles:
 * - Serif for authority (headlines), Sans for utility (UI)
 * - Single weight (500) for all serif headings
 * - Relaxed body line-height (1.60) for literary reading experience
 * - Tight-but-not-compressed headings (1.10-1.30)
 */

import { Platform } from 'react-native';

// ==========================================
// Font Families
// ==========================================

/**
 * Anthropic Serif (fallback: Georgia)
 * Used for ALL headlines and editorial content
 * Weight 500 only - no bold, no light
 */
export const fontFamily = {
  // Headline font - Serif for authority
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, serif',
  }),

  // UI font - Sans for utility
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, sans-serif',
  }),

  // Chinese font
  chinese: Platform.select({
    ios: 'PingFang SC',
    android: 'Noto Sans SC, sans-serif',
    default: 'sans-serif',
  }),

  // Code font - Mono strictly for code
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// ==========================================
// Font Sizes (px)
// Based on DESIGN.md hierarchy
// ==========================================

export const fontSize = {
  // Display / Hero - Maximum impact, book-title presence
  display: 64,        // 4rem
  
  // Section Heading - Feature section anchors
  sectionHeading: 52, // 3.25rem
  
  // Sub-headings
  subHeadingLarge: 36.8,  // ~2.3rem
  subHeading: 32,         // 2rem
  subHeadingSmall: 25.6,  // ~1.6rem
  
  // Feature Title
  featureTitle: 20.8,  // 1.3rem
  
  // Body text
  bodySerif: 17,       // 1.06rem - Serif body (editorial)
  bodyLarge: 20,       // 1.25rem - Intro paragraphs
  bodyStandard: 16,    // 1rem - Standard body, button text
  bodySmall: 15,       // 0.94rem - Compact body
  
  // UI text
  nav: 17,             // 1.06rem - Navigation links
  caption: 14,         // 0.88rem - Metadata, descriptions
  label: 12,           // 0.75rem - Badges, small labels
  overline: 10,        // 0.63rem - Uppercase overline labels
  micro: 9.6,          // 0.6rem - Smallest text
  
  // Code
  code: 15,            // 0.94rem - Inline code, terminal
};

// ==========================================
// Font Weights
// IMPORTANT: All serif headings use weight 500 ONLY
// ==========================================

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,   // The ONLY weight for serif headings
  semibold: '600' as const,
};

// ==========================================
// Line Heights
// ==========================================

export const lineHeight = {
  // Tight headings - serif letterforms need breathing room
  tight: 1.10,      // Display/Hero
  tightNormal: 1.20, // Section/Sub-headings
  normal: 1.30,     // Sub-heading small
  
  // Relaxed body - literary reading experience
  relaxed: 1.60,    // Most body text (significantly more than typical 1.4-1.5)
  
  // Compact UI
  compact: 1.00,    // Nav, compact UI
  standard: 1.25,   // Standard UI
  
  // Special cases
  caption: 1.43,    // Caption text
  overline: 1.60,   // Overline labels
};

// ==========================================
// Letter Spacing
// ==========================================

export const letterSpacing = {
  normal: 0,
  label: 0.12,      // 12px and below - maintain readability
  overline: 0.5,    // Uppercase overline labels
  code: -0.32,      // Inline code, terminal
  micro: 0.096,     // Smallest text
};

// ==========================================
// Pre-defined Text Styles
// Following DESIGN.md hierarchy exactly
// ==========================================

export const textStyles = {
  // ===== HEADLINES (All Serif, Weight 500) =====
  
  /**
   * Display / Hero
   * Maximum impact, book-title presence
   */
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.display * lineHeight.tight,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Section Heading
   * Feature section anchors
   */
  sectionHeading: {
    fontSize: fontSize.sectionHeading,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sectionHeading * lineHeight.tightNormal,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Sub-heading Large
   */
  subHeadingLarge: {
    fontSize: fontSize.subHeadingLarge,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.subHeadingLarge * lineHeight.normal,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Sub-heading
   * Card titles, feature names
   */
  subHeading: {
    fontSize: fontSize.subHeading,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.subHeading * lineHeight.tight,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Sub-heading Small
   */
  subHeadingSmall: {
    fontSize: fontSize.subHeadingSmall,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.subHeadingSmall * lineHeight.tightNormal,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Feature Title
   * Small feature headings
   */
  featureTitle: {
    fontSize: fontSize.featureTitle,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.featureTitle * lineHeight.tightNormal,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  // ===== BODY TEXT =====
  
  /**
   * Body Serif
   * Editorial passages - serif body text
   */
  bodySerif: {
    fontSize: fontSize.bodySerif,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodySerif * lineHeight.relaxed,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Body Large
   * Intro paragraphs
   */
  bodyLarge: {
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodyLarge * lineHeight.relaxed,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Body Standard
   * Standard body, button text
   */
  bodyStandard: {
    fontSize: fontSize.bodyStandard,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodyStandard * lineHeight.relaxed,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Body Small
   * Compact body text
   */
  bodySmall: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.bodySmall * lineHeight.standard,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  // ===== UI TEXT (All Sans) =====
  
  /**
   * Navigation
   * Navigation links, UI text
   */
  nav: {
    fontSize: fontSize.nav,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.nav * lineHeight.compact,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Caption
   * Metadata, descriptions
   */
  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.caption * lineHeight.caption,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Label
   * Badges, small labels - with letter-spacing for readability
   */
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.label * lineHeight.standard,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.label,
  },

  /**
   * Overline
   * Uppercase overline labels
   */
  overline: {
    fontSize: fontSize.overline,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.overline * lineHeight.overline,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.overline,
    textTransform: 'uppercase' as const,
  },

  /**
   * Micro
   * Smallest text
   */
  micro: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.micro * lineHeight.relaxed,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.micro,
  },

  // ===== CODE =====
  
  /**
   * Code
   * Inline code, terminal - strictly for code content
   */
  code: {
    fontSize: fontSize.code,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.code * lineHeight.relaxed,
    fontFamily: fontFamily.mono,
    letterSpacing: letterSpacing.code,
  },

  // ===== BUTTON TEXT =====
  
  /**
   * Button
   * Standard button text
   */
  button: {
    fontSize: fontSize.bodyStandard,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.bodyStandard * lineHeight.standard,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  /**
   * Button Small
   * Compact button text
   */
  buttonSmall: {
    fontSize: fontSize.bodySerif,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.bodySerif * lineHeight.standard,
    fontFamily: fontFamily.sans,
    letterSpacing: letterSpacing.normal,
  },

  // ===== ARTICLE SPECIFIC (Legacy Support) =====
  
  /**
   * Article Paragraph
   * For article content - using serif for literary feel
   * Note: This is larger than standard body for better readability
   */
  article: {
    fontSize: 30,
    fontWeight: fontWeight.regular,
    lineHeight: 44,
    fontFamily: fontFamily.serif,
    letterSpacing: letterSpacing.normal,
  },
};
