/**
 * 全局类型声明
 */

// 环境变量类型定义
declare namespace NodeJS {
	interface ProcessEnv {
		EXPO_PUBLIC_API_URL?: string;
		EXPO_PUBLIC_ENV?: "development" | "staging" | "production";
		EXPO_PUBLIC_SENTRY_DSN?: string;
		EXPO_PUBLIC_ANALYTICS_ID?: string;
	}
}

// React Native 扩展
declare module "react-native" {
	interface ViewProps {
		className?: string;
	}
}
