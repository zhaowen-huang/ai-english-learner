import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export default function Loading({ 
  message = '加载中...',
  size = 'large',
  color = '#C19A6B',
  style
}: LoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#8B8680',
    fontWeight: '500',
  },
});
