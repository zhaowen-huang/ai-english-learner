import { Tabs, Redirect, usePathname } from 'expo-router';
import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { Feather } from '@expo/vector-icons';

const tabItems = [
  { name: 'articles', label: '看新闻', icon: 'book-open' },
  { name: 'vocabulary', label: '生词本', icon: 'bookmark' },
  { name: 'review', label: '背单词', icon: 'zap' },
] as const;

function TabIcon({ focused, name }: { focused: boolean; name: string }) {
  return (
    <Feather 
      name={name as any} 
      size={24} 
      color={focused ? '#C19A6B' : '#8B8680'} 
    />
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'web' ? 70 : 70 + (Platform.OS === 'ios' ? insets.bottom : 0);
  
  // 过滤掉 index 路由，不显示为 tab
  const visibleRoutes = state.routes.filter((route: any) => route.name !== 'index');
  
  return (
    <View style={[styles.tabBar, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 8, height: tabBarHeight }]}>
      {visibleRoutes.map((route: any, index: number) => {
        const isFocused = state.routes.indexOf(route) === state.index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const tabIcon = options.tabBarIcon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.tabIndicator} />}
            <View style={styles.tabContent}>
              {tabIcon && tabIcon({ focused: isFocused })}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingTop: 8,
    height: 70,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#C19A6B',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B8680',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#C19A6B',
  },
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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FAF8F5',
        },
        headerTintColor: '#2C2C2C',
        headerTitleStyle: {
          fontWeight: '600',
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
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} name="book-open" />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: '生词本',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} name="bookmark" />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: '背单词',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} name="zap" />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}