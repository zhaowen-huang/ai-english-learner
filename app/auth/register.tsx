import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { validateRegister } from '@/utils/validation';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signUp, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // 清除错误当用户开始输入
  useEffect(() => {
    if (validationError || error) {
      setValidationError(null);
      clearError();
    }
  }, [email, password, confirmPassword]);

  const handleRegister = async () => {
    // 前端验证
    const validation = validateRegister(email, password, confirmPassword);
    if (!validation.isValid) {
      setValidationError(validation.error || '验证失败');
      return;
    }

    try {
      await signUp(email, password, confirmPassword);
      Alert.alert(
        '✅ 注册成功',
        '欢迎加入 AI English Learner！',
        [{ 
          text: '开始学习', 
          onPress: () => router.replace('/(tabs)') 
        }]
      );
    } catch (error: any) {
      Alert.alert('❌ 注册失败', error.message || '请稍后重试');
    }
  };

  const isSubmitting = isLoading;

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
            <Text style={styles.logoText}>✨</Text>
          </View>
          <Text style={styles.title}>创建账户</Text>
          <Text style={styles.subtitle}>开始你的英语学习之旅</Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.form}>
          {/* 邮箱输入 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>邮箱</Text>
            <TextInput
              style={[
                styles.input,
                validationError && styles.inputError,
              ]}
              placeholder="请输入邮箱"
              placeholderTextColor="#8B8680"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isSubmitting}
              returnKeyType="next"
            />
          </View>

          {/* 密码输入 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={[
                styles.input,
                validationError && styles.inputError,
              ]}
              placeholder="请输入密码（至少6位）"
              placeholderTextColor="#8B8680"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
              autoComplete="password-new"
              returnKeyType="next"
            />
          </View>

          {/* 确认密码输入 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>确认密码</Text>
            <TextInput
              style={[
                styles.input,
                validationError && styles.inputError,
              ]}
              placeholder="请再次输入密码"
              placeholderTextColor="#8B8680"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isSubmitting}
              autoComplete="password-new"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          {/* 验证错误提示 */}
          {(validationError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError || error}</Text>
            </View>
          )}

          {/* 注册按钮 */}
          <TouchableOpacity
            style={[styles.registerButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>注册</Text>
            )}
          </TouchableOpacity>

          {/* 登录链接 */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/auth/login' as any)}
            disabled={isSubmitting}
          >
            <Text style={styles.loginText}>
              已有账户？<Text style={styles.loginHighlight}>立即登录</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B8680',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C2C2C',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDF2F2',
  },
  errorContainer: {
    backgroundColor: '#FDF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
  },
  registerButton: {
    backgroundColor: '#C19A6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: '#8B8680',
  },
  loginHighlight: {
    color: '#C19A6B',
    fontWeight: '600',
  },
});
