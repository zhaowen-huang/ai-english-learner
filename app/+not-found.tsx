import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-4 bg-gray-50">
        <Text className="text-6xl mb-4">😕</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          页面未找到
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          抱歉，我们找不到你要访问的页面
        </Text>
        <Link href="/" className="text-blue-600 font-semibold">
          返回首页
        </Link>
      </View>
    </>
  );
}
