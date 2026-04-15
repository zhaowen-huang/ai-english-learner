import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { validateLogin } from '@/utils/validation';
import { Button, Input } from '@/components';
import { colors, textStyles, borderRadius } from '@/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signIn, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // 清除错误当用户开始输入
  useEffect(() => {
    if (validationError || error) {
      setValidationError(null);
      clearError();
    }
  }, [email, password]);

  const handleLogin = async () => {
    // 前端验证
    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      setValidationError(validation.error || '验证失败');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请检查邮箱和密码');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo区域 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📚</Text>
          </View>
          <Text style={styles.title}>欢迎回来</Text>
          <Text style={styles.subtitle}>登录你的账户继续学习</Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.form}>
          {/* 邮箱输入 */}
          <Input
            label="邮箱"
            placeholder="请输入邮箱"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
            error={validationError && !email ? validationError : undefined}
            returnKeyType="next"
          />

          {/* 密码输入 */}
          <Input
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            autoComplete="password"
            error={validationError && !password ? validationError : undefined}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* 全局错误提示 */}
          {(validationError && email && password) || error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError || error}</Text>
            </View>
          ) : null}

          {/* 登录按钮 */}
          <Button
            title={isLoading ? '登录中...' : '登录'}
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />

          {/* 注册链接 */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>
              还没有账户？{' '}
              <Text 
                style={styles.registerHighlight}
                onPress={() => !isLoading && router.push('/auth/register' as any)}
              >
                立即注册
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoText: {
    fontSize: 44,
  },
  title: {
    ...textStyles.subHeading,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...textStyles.bodyLarge,
    color: colors.text.tertiary,
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    backgroundColor: '#f8f0f0',  // Light error background
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    ...textStyles.bodyStandard,
    color: colors.text.tertiary,
  },
  registerHighlight: {
    color: colors.primary.DEFAULT,
    fontWeight: textStyles.button.fontWeight,
  },
});
