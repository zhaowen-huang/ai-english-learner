import { Tabs, Redirect } from 'expo-router';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';

// 简单的图标组件（可以用真实的图标库替换）
function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  return (
    <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.5 }]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuthStore();

  // 如果未登录，重定向到登录页
  if (!isLoading && !user) {
    return <Redirect href="/auth/login" />;
  }

  // 加载中显示空白
  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 8,
          paddingTop: 8,
          height: Platform.OS === 'web' ? 60 : 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
          backgroundColor: '#ffffff',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" />,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: '文章',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📚" />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: '生词本',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📝" />,
        }}
      />
      <Tabs.Screen
        name="ai-news"
        options={{
          title: 'AI新闻',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🤖" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📊" />,
        }}
      />
    </Tabs>
  );
}
