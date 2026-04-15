import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, textStyles } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 标签 */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {/* 输入框容器 */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          props.editable === false && styles.inputContainerDisabled,
        ]}
      >
        {/* 左侧图标 */}
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        {/* 输入框 */}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : {},
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : {},
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />

        {/* 右侧图标或密码显示按钮 */}
        {(rightIcon || secureTextEntry) && (
          <View style={styles.rightIcon}>
            {secureTextEntry ? (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {/* @ts-ignore */}
                {showPassword ? <EyeOff size={20} stroke={colors.text.tertiary} /> : <Eye size={20} stroke={colors.text.tertiary} />}
              </TouchableOpacity>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>

      {/* 错误消息或帮助文本 */}
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    ...textStyles.label,
    color: colors.text.primary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: colors.border.focus,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.border.error,
    backgroundColor: '#f8f0f0',  // Light error background
  },
  inputContainerDisabled: {
    backgroundColor: colors.sand,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 2,
  },
  inputWithLeftIcon: {
    marginLeft: 12,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 8,
  },
  showPasswordText: {
    fontSize: 18,
  },
  helperText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
  },
});
