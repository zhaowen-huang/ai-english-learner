/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 验证 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度（至少8位，包含字母和数字）
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

/**
 * 检查字符串是否为空或只包含空白字符
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * 验证登录表单
 */
export function validateLogin(email: string, password: string): ValidationResult {
  if (isBlank(email)) {
    return { isValid: false, error: '请输入邮箱' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: '邮箱格式不正确' };
  }

  if (isBlank(password)) {
    return { isValid: false, error: '请输入密码' };
  }

  if (password.length < 6) {
    return { isValid: false, error: '密码长度至少为6位' };
  }

  return { isValid: true };
}

/**
 * 验证注册表单
 */
export function validateRegister(
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  // 验证邮箱
  if (isBlank(email)) {
    return { isValid: false, error: '请输入邮箱' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: '邮箱格式不正确' };
  }

  // 验证密码
  if (isBlank(password)) {
    return { isValid: false, error: '请输入密码' };
  }

  if (password.length < 6) {
    return { isValid: false, error: '密码长度至少为6位' };
  }

  // 验证确认密码
  if (isBlank(confirmPassword)) {
    return { isValid: false, error: '请确认密码' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: '两次输入的密码不一致' };
  }

  return { isValid: true };
}

/**
 * 获取友好的认证错误消息
 */
export function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'User already registered': '该邮箱已被注册',
    'Email not confirmed': '邮箱未验证，请检查邮件',
    'Too many requests': '请求过于频繁，请稍后再试',
    'Weak password': '密码强度不够',
    'Email exists': '该邮箱已被注册',
    'invalid_email': '邮箱格式不正确',
    'invalid_password': '密码不符合要求',
    'user_not_found': '用户不存在',
    'wrong_password': '密码错误',
  };

  return errorMessages[errorCode] || '操作失败，请稍后重试';
}
