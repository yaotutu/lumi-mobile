/**
 * 认证 Store 类型定义
 */

/**
 * 用户信息（匹配后端外部用户服务 UserInfoData 结构）
 */
export interface UserProfile {
  id: string;
  userName: string;
  nickName: string;
  email?: string;
  avatar?: string | null;
  gender?: string;
  createdAt?: number; // Unix 时间戳（秒）
  updatedAt?: number; // Unix 时间戳（秒）
}

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 用户信息 */
  user: UserProfile | null;
  /** Token */
  token: string | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否正在提交（登录/注册/登出） */
  isSubmitting: boolean;
  /** 是否正在发送验证码 */
  isSendingCode: boolean;
}

/**
 * 认证操作
 */
export interface AuthActions {
  /** 发送验证码 */
  sendVerificationCode: (email: string, type: 'login' | 'register') => Promise<boolean>;
  /** 注册 */
  register: (email: string, code: string) => Promise<boolean>;
  /** 登录 */
  login: (email: string, code: string) => Promise<boolean>;
  /** 登出 */
  logout: () => Promise<void>;
  /** 获取用户信息 */
  fetchProfile: () => Promise<void>;
  /** 检查登录状态 */
  checkAuth: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}
