/**
 * Design System Colors - Inspired by Claude (Anthropic)
 * 
 * Visual Theme: A literary salon reimagined as a product page
 * - Warm parchment canvas evoking premium paper
 * - Exclusively warm-toned neutrals (yellow-brown undertones)
 * - Terracotta brand accent - earthy and un-tech
 * - No cool blue-grays anywhere
 */

export const colors = {
  // ==========================================
  // Primary Colors
  // ==========================================
  
  /**
   * Anthropic Near Black (#141413)
   * The primary text color and dark-theme surface
   * Not pure black but a warm, almost olive-tinted dark
   */
  nearBlack: '#141413',
  
  /**
   * Terracotta Brand (#c96442)
   * The core brand color - burnt orange-brown
   * Used for primary CTA buttons and brand moments
   * Deliberately earthy and un-tech
   */
  terracotta: '#c96442',
  
  /**
   * Coral Accent (#d97757)
   * Lighter, warmer variant of brand color
   * Used for text accents and links on dark surfaces
   */
  coral: '#d97757',

  // ==========================================
  // Surface & Background Colors
  // ==========================================
  
  /**
   * Parchment (#f5f4ed)
   * The PRIMARY page background
   * Warm cream with yellow-green tint
   * Feels like aged paper - the emotional foundation
   */
  parchment: '#f5f4ed',
  
  /**
   * Ivory (#faf9f5)
   * The lightest surface
   * Used for cards and elevated containers on Parchment
   * Barely distinguishable but creates subtle layering
   */
  ivory: '#faf9f5',
  
  /**
   * Pure White (#ffffff)
   * Reserved for specific button surfaces
   * Maximum-contrast elements only
   */
  white: '#ffffff',
  
  /**
   * Warm Sand (#e8e6dc)
   * Button backgrounds and prominent interactive surfaces
   * Noticeably warm light gray
   */
  sand: '#e8e6dc',
  
  /**
   * Dark Surface (#30302e)
   * Dark-theme containers, nav borders
   * Warm charcoal
   */
  darkSurface: '#30302e',
  
  /**
   * Deep Dark (#141413)
   * Dark-theme page background
   * Same as nearBlack
   */
  deepDark: '#141413',

  // ==========================================
  // Neutral Text Colors (All Warm-Toned)
  // ==========================================
  
  /**
   * Charcoal Warm (#4d4c48)
   * Button text on light warm surfaces
   * The go-to dark-on-light text
   */
  charcoal: '#4d4c48',
  
  /**
   * Olive Gray (#5e5d59)
   * Secondary body text
   * Distinctly warm medium-dark gray
   */
  oliveGray: '#5e5d59',
  
  /**
   * Stone Gray (#87867f)
   * Tertiary text, footnotes, de-emphasized metadata
   */
  stoneGray: '#87867f',
  
  /**
   * Dark Warm (#3d3d3a)
   * Dark text links and emphasized secondary text
   */
  darkWarm: '#3d3d3a',
  
  /**
   * Warm Silver (#b0aea5)
   * Text on dark surfaces
   * Warm, parchment-tinted light gray
   */
  silver: '#b0aea5',

  // ==========================================
  // Border Colors (Warm Cream-Tinted)
  // ==========================================
  
  /**
   * Border Cream (#f0eee6)
   * Standard light-theme border
   * Barely visible warm cream
   * Creates the gentlest possible containment
   */
  borderCream: '#f0eee6',
  
  /**
   * Border Warm (#e8e6dc)
   * Prominent borders, section dividers
   * Emphasized containment on light surfaces
   */
  borderWarm: '#e8e6dc',
  
  /**
   * Border Dark (#30302e)
   * Standard border on dark surfaces
   * Maintains the warm tone
   */
  borderDark: '#30302e',

  // ==========================================
  // Ring Shadow Colors (Interactive States)
  // ==========================================
  
  /**
   * Ring Warm (#d1cfc5)
   * Shadow ring color for button hover/focus states
   */
  ringWarm: '#d1cfc5',
  
  /**
   * Ring Subtle (#dedc01)
   * Secondary ring variant for lighter surfaces
   */
  ringSubtle: '#dedc01',
  
  /**
   * Ring Deep (#c2c0b6)
   * Deeper ring for active/pressed states
   */
  ringDeep: '#c2c0b6',

  // ==========================================
  // Semantic Colors
  // ==========================================
  
  /**
   * Error Crimson (#b53333)
   * Deep, warm red for error states
   * Serious without being alarming
   */
  error: '#b53333',
  
  /**
   * Focus Blue (#3898ec)
   * Standard blue for input focus rings
   * THE ONLY COOL COLOR in the entire system
   * Used purely for accessibility
   */
  focusBlue: '#3898ec',
  
  /**
   * Success Green (custom warm green)
   * Muted green matching the organic illustration palette
   */
  success: '#6B8E6B',
  
  /**
   * Warning Amber (custom warm amber)
   * Warm amber tone
   */
  warning: '#D4A574',

  // ==========================================
  // Aliases for Backward Compatibility
  // ==========================================
  
  // Primary alias
  primary: {
    DEFAULT: '#c96442',  // terracotta
    light: '#d97757',    // coral
    dark: '#b55535',
    lighter: '#e8c4b8',
    darker: '#9a4a30',
  },
  
  // Background aliases
  background: '#f5f4ed',  // parchment
  surface: '#faf9f5',     // ivory
  overlay: 'rgba(20, 20, 19, 0.5)',  // nearBlack with opacity
  
  // Text color aliases
  text: {
    primary: '#141413',    // nearBlack
    secondary: '#5e5d59',  // oliveGray
    tertiary: '#87867f',   // stoneGray
    disabled: '#b0aea5',   // silver
    inverse: '#faf9f5',    // ivory
  },
  
  // Border color aliases
  border: {
    default: '#f0eee6',    // borderCream
    focus: '#3898ec',      // focusBlue (accessibility)
    error: '#b53333',      // error
    success: '#6B8E6B',    // success
  },
} as const;

export type ColorKey = keyof typeof colors;
export type PrimaryColorKey = keyof typeof colors.primary;
