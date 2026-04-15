import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, textStyles } from '@/theme';

export type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'md',
  style,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignSelf: 'flex-start',
    };

    // 尺寸
    switch (size) {
      case 'sm':
        baseStyle.paddingHorizontal = 8;
        baseStyle.paddingVertical = 3;
        break;
      case 'md':
        baseStyle.paddingHorizontal = 10;
        baseStyle.paddingVertical = 4;
        break;
      case 'lg':
        baseStyle.paddingHorizontal = 12;
        baseStyle.paddingVertical = 6;
        break;
    }

    // 变体
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary.lighter;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary.DEFAULT;
        break;
      case 'success':
        baseStyle.backgroundColor = '#d4e6d4';  // Light success background
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.success;
        break;
      case 'error':
        baseStyle.backgroundColor = '#e6d4d4';  // Light error background
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.error;
        break;
      case 'warning':
        baseStyle.backgroundColor = '#f0e6d8';  // Light warning background
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.warning;
        break;
      case 'info':
        baseStyle.backgroundColor = '#d4e0f0';  // Light info background
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.focusBlue;
        break;
      case 'neutral':
        baseStyle.backgroundColor = colors.sand;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.silver;
        break;
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any = {
      ...textStyles.caption,
    };

    switch (size) {
      case 'sm':
        baseStyle.fontSize = 10;
        break;
      case 'md':
        baseStyle.fontSize = 11;
        break;
      case 'lg':
        baseStyle.fontSize = 13;
        break;
    }

    switch (variant) {
      case 'primary':
        baseStyle.color = colors.primary.darker;
        break;
      case 'success':
        baseStyle.color = '#4a6e4a';  // Dark success text
        break;
      case 'error':
        baseStyle.color = '#8a2a2a';  // Dark error text
        break;
      case 'warning':
        baseStyle.color = '#a07850';  // Dark warning text
        break;
      case 'info':
        baseStyle.color = '#2a6aaa';  // Dark info text
        break;
      case 'neutral':
        baseStyle.color = colors.text.secondary;
        break;
    }

    return baseStyle;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  );
}
