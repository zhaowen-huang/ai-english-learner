import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Bookmark, BarChart3, Database, LogOut, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/theme';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BookOpen;
  route: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: '阅读文章',
      subtitle: '浏览精选英语文章',
      icon: BookOpen,
      route: '/(tabs)/articles',
    },
    {
      id: '2',
      title: '生词本',
      subtitle: '查看我的生词',
      icon: Bookmark,
      route: '/(tabs)/vocabulary',
    },
    {
      id: '3',
      title: '学习统计',
      subtitle: '查看学习进度',
      icon: BarChart3,
      route: '/(tabs)/stats',
    },
    {
      id: '4',
      title: 'AI 缓存管理',
      subtitle: '管理 AI 生成内容缓存',
      icon: Database,
      route: '/(tabs)/ai-cache-manager',
    },
  ];

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || '学习者'}</Text>
          <Text style={styles.userSubtitle}>英语学习助手</Text>
        </View>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.route)}
            >
              <View style={styles.menuIcon}>
                {/* @ts-ignore */}
                <item.icon size={20} stroke={colors.primary.DEFAULT} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              {/* @ts-ignore */}
              <ChevronRight size={20} stroke={colors.text.tertiary} />
            </TouchableOpacity>
          ))}

          {/* Logout Item */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={signOut}
          >
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              {/* @ts-ignore */}
              <LogOut size={20} stroke={colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutText]}>退出登录</Text>
              <Text style={styles.menuSubtitle}>安全退出当前账号</Text>
            </View>
            {/* @ts-ignore */}
            <ChevronRight size={20} stroke={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  arrow: {
    fontSize: 24,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutIcon: {
    backgroundColor: '#FFF3F3',
  },
  logoutText: {
    color: '#FF3B30',
  },
});
