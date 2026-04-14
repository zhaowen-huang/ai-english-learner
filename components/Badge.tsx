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
        baseStyle.backgroundColor = colors.success.lighter;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.success.DEFAULT;
        break;
      case 'error':
        baseStyle.backgroundColor = colors.error.lighter;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.error.DEFAULT;
        break;
      case 'warning':
        baseStyle.backgroundColor = colors.warning.lighter;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.warning.DEFAULT;
        break;
      case 'info':
        baseStyle.backgroundColor = colors.info.lighter;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.info.DEFAULT;
        break;
      case 'neutral':
        baseStyle.backgroundColor = colors.neutral[100];
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.neutral[300];
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
        baseStyle.color = colors.success.dark;
        break;
      case 'error':
        baseStyle.color = colors.error.dark;
        break;
      case 'warning':
        baseStyle.color = colors.warning.dark;
        break;
      case 'info':
        baseStyle.color = colors.info.dark;
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
