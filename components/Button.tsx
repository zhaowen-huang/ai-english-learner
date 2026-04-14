import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, shadows, textStyles } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // 尺寸
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = 10;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'md':
        baseStyle.paddingVertical = 14;
        baseStyle.paddingHorizontal = 24;
        break;
      case 'lg':
        baseStyle.paddingVertical = 18;
        baseStyle.paddingHorizontal = 32;
        break;
    }

    // 变体
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary.DEFAULT;
        if (!isDisabled) {
          Object.assign(baseStyle, shadows.primary);
        }
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.neutral[100];
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = colors.primary.DEFAULT;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    // 禁用状态
    if (isDisabled) {
      baseStyle.opacity = 0.5;
    }

    // 全宽
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: any = {
      ...textStyles.button,
    };

    // 尺寸
    switch (size) {
      case 'sm':
        baseStyle.fontSize = 14;
        break;
      case 'md':
        baseStyle.fontSize = 16;
        break;
      case 'lg':
        baseStyle.fontSize = 18;
        break;
    }

    // 颜色
    switch (variant) {
      case 'primary':
        baseStyle.color = colors.text.inverse;
        break;
      case 'secondary':
        baseStyle.color = colors.text.primary;
        break;
      case 'outline':
        baseStyle.color = colors.primary.DEFAULT;
        break;
      case 'ghost':
        baseStyle.color = colors.primary.DEFAULT;
        break;
    }

    // 禁用状态
    if (isDisabled) {
      baseStyle.color = colors.text.disabled;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.text.inverse : colors.primary.DEFAULT} 
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[getTextStyle(), leftIcon && { marginLeft: 8 }, rightIcon && { marginRight: 8 }, textStyle]}>
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
