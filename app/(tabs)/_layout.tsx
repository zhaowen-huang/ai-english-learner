import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Bookmark } from 'lucide-react-native';
import { colors, textStyles, shadows } from '@/theme';

const tabItems = [
  { name: 'articles', label: '看新闻', icon: 'book-open' },
  { name: 'vocabulary', label: '生词本', icon: 'bookmark' },
] as const;

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  const IconComponent = icon === 'book-open' ? BookOpen : Bookmark;
  
  return (
    <View style={styles.iconContainer}>
      {/* @ts-ignore */}
      <IconComponent 
        size={24} 
        color={focused ? colors.primary.DEFAULT : colors.text.tertiary} 
      />
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
