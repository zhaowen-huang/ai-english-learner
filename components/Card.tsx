import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  rounded?: keyof typeof borderRadius;
  shadow?: keyof typeof shadows;
  style?: ViewStyle;
  activeOpacity?: number;
}

export default function Card({
  children,
  onPress,
  padding = 20,
  rounded = 'lg',
  shadow = 'md',
  style,
  activeOpacity = 0.7,
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: borderRadius[rounded],
    padding,
    ...shadows[shadow],
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}
