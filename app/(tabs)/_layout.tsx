import { Tabs } from 'expo-router';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, textStyles, shadows } from '@/theme';

const tabItems = [
  { name: 'articles', label: '看新闻', icon: 'book-open' },
  { name: 'vocabulary', label: '生词本', icon: 'bookmark' },
  { name: 'review', label: '背单词', icon: 'zap' },
] as const;

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  // 简单的图标映射 - 使用emoji作为临时方案
  const iconMap: Record<string, string> = {
    'book-open': '📖',
    'bookmark': '📚',
    'zap': '⚡',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={{ fontSize: 22 }}>{iconMap[icon] || '📄'}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'web' ? 70 : 70 + (Platform.OS === 'ios' ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 8,
          height: tabBarHeight,
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          ...textStyles.caption,
          marginTop: 4,
          fontSize: 11,
        },
      }}
      initialRouteName="articles"
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: '看新闻',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="book-open" />
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: '生词本',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="bookmark" />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: '背单词',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="zap" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
