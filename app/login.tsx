/**
 * 登录/注册页面
 *
 * 功能：
 * - 邮箱 + 验证码登录（验证码为英文字母+数字组合）
 * - 邮箱 + 验证码注册（验证码为英文字母+数字组合）
 * - 选项卡切换登录/注册模式
 * - 倒计时验证码发送
 * - 表单验证
 * - 与项目风格保持一致
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores';
import { logger } from '@/utils/logger';

// ============================================
// 类型定义
// ============================================

type AuthMode = 'login' | 'register';

// ============================================
// 常量
// ============================================

const COUNTDOWN_SECONDS = 60; // 验证码倒计时时长（秒）

// ============================================
// 主页面组件
// ============================================

export default function LoginScreen() {
  // 获取主题颜色
  const tint = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const text = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'secondaryText');
  const border = useThemeColor({}, 'border');

  // 认证 Store
  const { sendVerificationCode, register, login, isSubmitting, isSendingCode } = useAuthStore();

  // ============================================
  // 状态管理
  // ============================================

  // 当前模式（登录/注册）
  const [mode, setMode] = useState<AuthMode>('login');

  // 表单数据
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // 错误信息
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);

  // ============================================
  // 倒计时效果
  // ============================================

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // ============================================
  // 验证函数
  // ============================================

  /**
   * 验证邮箱格式
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // 验证邮箱
    if (!email.trim()) {
      setEmailError('请输入邮箱地址');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      isValid = false;
    } else {
      setEmailError('');
    }

    // 验证验证码
    if (!code.trim()) {
      setCodeError('请输入验证码');
      isValid = false;
    } else if (code.length < 4 || code.length > 6) {
      setCodeError('验证码应为 4-6 位');
      isValid = false;
    } else {
      setCodeError('');
    }

    return isValid;
  };

  // ============================================
  // 事件处理
  // ============================================

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    // 清空之前的错误
    setEmailError('');
    setSubmitError('');

    // 验证邮箱
    if (!email.trim()) {
      setEmailError('请输入邮箱地址');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    // 发送验证码
    const type = mode === 'login' ? 'login' : 'register';
    const success = await sendVerificationCode(email, type);

    if (success) {
      // 开始倒计时
      setCountdown(COUNTDOWN_SECONDS);
    } else {
      setSubmitError('发送验证码失败，请稍后重试');
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    // 清空之前的错误
    setSubmitError('');

    // 验证表单
    if (!validateForm()) {
      return;
    }

    // 根据模式执行不同操作
    let success = false;

    if (mode === 'login') {
      success = await login(email.trim(), code.trim());

      if (success) {
        // 登录成功，跳转到首页
        logger.info('登录成功，跳转到首页');
        router.replace('/(tabs)/discover' as any);
      } else {
        setSubmitError('登录失败，请检查邮箱和验证码');
      }
    } else {
      success = await register(email.trim(), code.trim());

      if (success) {
        // 注册成功，自动登录
        logger.info('注册成功，自动登录');
        success = await login(email.trim(), code.trim());

        if (success) {
          router.replace('/(tabs)/discover' as any);
        }
      } else {
        setSubmitError('注册失败，请检查邮箱和验证码');
      }
    }
  };

  // ============================================
  // UI 渲染
  // ============================================

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================
            Logo 和标题区域
            ======================================== */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[tint, '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <ThemedText style={styles.logoText}>L</ThemedText>
            </LinearGradient>
          </View>

          <ThemedText style={styles.title} type="title">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </ThemedText>

          <ThemedText style={styles.subtitle} lightColor={secondaryText} darkColor={secondaryText}>
            {mode === 'login' ? '使用邮箱验证码登录您的账号' : '使用邮箱验证码创建新账号'}
          </ThemedText>
        </View>

        {/* ========================================
            模式切换选项卡
            ======================================== */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              mode === 'login' && styles.tabActive,
              mode === 'login' && { borderColor: tint },
            ]}
            onPress={() => {
              setMode('login');
              setSubmitError('');
            }}
          >
            <ThemedText
              style={[
                styles.tabText,
                mode === 'login' && styles.tabTextActive,
                mode === 'login' && { color: tint },
              ]}
            >
              登录
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              mode === 'register' && styles.tabActive,
              mode === 'register' && { borderColor: tint },
            ]}
            onPress={() => {
              setMode('register');
              setSubmitError('');
            }}
          >
            <ThemedText
              style={[
                styles.tabText,
                mode === 'register' && styles.tabTextActive,
                mode === 'register' && { color: tint },
              ]}
            >
              注册
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* ========================================
            表单区域
            ======================================== */}
        <View style={styles.form}>
          {/* 邮箱输入 */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>邮箱地址</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: cardBackground,
                  color: text,
                  borderColor: emailError ? '#FF3B30' : border,
                },
              ]}
              placeholder="请输入邮箱地址"
              placeholderTextColor={secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
            />
            {emailError ? <ThemedText style={styles.errorText}>{emailError}</ThemedText> : null}
          </View>

          {/* 验证码输入 */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>验证码</ThemedText>
            <View style={styles.codeInputRow}>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    backgroundColor: cardBackground,
                    color: text,
                    borderColor: codeError ? '#FF3B30' : border,
                  },
                ]}
                placeholder="请输入验证码"
                placeholderTextColor={secondaryText}
                keyboardType="ascii-capable"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                value={code}
                onChangeText={text => {
                  setCode(text);
                  if (codeError) setCodeError('');
                }}
              />

              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  countdown > 0 && styles.sendCodeButtonDisabled,
                  { backgroundColor: countdown > 0 ? `${border}` : tint },
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || isSendingCode}
              >
                {isSendingCode ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText
                    style={[
                      styles.sendCodeButtonText,
                      { color: countdown > 0 ? secondaryText : '#FFFFFF' },
                    ]}
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
            {codeError ? <ThemedText style={styles.errorText}>{codeError}</ThemedText> : null}
          </View>

          {/* 提交错误信息 */}
          {submitError ? (
            <ThemedText style={styles.submitErrorText}>{submitError}</ThemedText>
          ) : null}

          {/* 提交按钮 */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tint }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                {mode === 'login' ? '登录' : '注册'}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* ========================================
            底部信息
            ======================================== */}
        <View style={styles.footer}>
          <ThemedText
            style={styles.footerText}
            lightColor={Colors.light.tertiaryText}
            darkColor={Colors.dark.tertiaryText}
          >
            登录即表示同意我们的服务条款和隐私政策
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// 样式定义
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // 头部
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },

  // 选项卡
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },

  // 表单
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    marginRight: 12,
  },
  sendCodeButton: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
  },
  sendCodeButtonDisabled: {
    opacity: 0.6,
  },
  sendCodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 6,
  },
  submitErrorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 底部
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
