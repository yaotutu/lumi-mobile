import { logger } from '@/utils/logger';

export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export const categorizeError = (error: Error): { type: ErrorType; message: string } => {
  if (error.message.includes('无法连接到服务器') || error.message.includes('网络请求失败')) {
    return {
      type: ErrorType.NETWORK,
      message: '网络连接有问题，请检查网络设置',
    };
  }

  if (error.message.includes('服务器出错了')) {
    return {
      type: ErrorType.SERVER,
      message: '服务器暂时繁忙，请稍后重试',
    };
  }

  if (error.message.includes('请输入') || error.message.includes('请选择')) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: '操作失败，请重试',
  };
};

export const logError = (error: Error, context?: string) => {
  const { type, message } = categorizeError(error);
  logger.error(`[${type.toUpperCase()}] ${context || '未知错误'}:`, error);
  return { type, message };
};
