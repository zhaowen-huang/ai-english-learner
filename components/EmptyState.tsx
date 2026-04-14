import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles } from '@/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  action: {
    marginTop: 8,
  },
});
