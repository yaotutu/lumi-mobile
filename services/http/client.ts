/**
 * 统一的 HTTP 客户端
 * 封装所有 API 请求的通用逻辑
 */

import { API_CONFIG } from "@/config/api";
import { logger } from "@/utils/logger";

// 请求配置
export interface RequestConfig extends RequestInit {
	timeout?: number;
	retryAttempts?: number;
	retryDelay?: number;
}

// HTTP 错误类
export class HTTPError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		message: string,
	) {
		super(message);
		this.name = "HTTPError";
	}
}

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 统一的 HTTP 请求函数
 */
export async function request<T = any>(
	endpoint: string,
	config: RequestConfig = {},
): Promise<T> {
	const {
		timeout = API_CONFIG.timeout,
		retryAttempts = 0, // 默认不重试,让调用方决定
		retryDelay = API_CONFIG.retryDelay,
		headers = {},
		...restConfig
	} = config;

	const url = endpoint.startsWith("http")
		? endpoint
		: `${API_CONFIG.baseURL}${endpoint}`;

	// 创建超时控制器
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	let lastError: Error | null = null;

	// 重试逻辑
	for (let attempt = 0; attempt <= retryAttempts; attempt++) {
		try {
			const response = await fetch(url, {
				...restConfig,
				headers: {
					"Content-Type": "application/json",
					...headers,
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			// 处理 HTTP 错误
			if (!response.ok) {
				if (response.status >= 500) {
					throw new HTTPError(
						response.status,
						response.statusText,
						"服务器出错了,请稍后重试",
					);
				}
				throw new HTTPError(
					response.status,
					response.statusText,
					`HTTP error! status: ${response.status}`,
				);
			}

			// 解析响应
			const data: T = await response.json();
			return data;
		} catch (error) {
			clearTimeout(timeoutId);

			// 处理中断错误
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw new Error("连接超时,请检查网络");
				}
				if (
					error.message.includes("Failed to fetch") ||
					error.message.includes("Network request failed")
				) {
					throw new Error("无法连接到服务器");
				}
			}

			// 记录最后一个错误
			lastError = error as Error;

			// 如果还有重试次数,等待后重试
			if (attempt < retryAttempts) {
				await delay(retryDelay * (attempt + 1)); // 指数退避
				continue;
			}

			// 重试次数用尽,抛出错误
			logger.error("HTTP 请求失败:", error);
			throw lastError;
		}
	}

	// 不应该到这里
	throw lastError || new Error("Unknown error occurred");
}

/**
 * GET 请求
 */
export async function get<T = any>(
	endpoint: string,
	params?: Record<string, string | number>,
	config?: RequestConfig,
): Promise<T> {
	const url = new URL(
		endpoint.startsWith("http") ? endpoint : `${API_CONFIG.baseURL}${endpoint}`,
	);

	// 添加查询参数
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, value.toString());
		});
	}

	return request<T>(url.toString(), {
		method: "GET",
		...config,
	});
}

/**
 * POST 请求
 */
export async function post<T = any>(
	endpoint: string,
	data?: any,
	config?: RequestConfig,
): Promise<T> {
	return request<T>(endpoint, {
		method: "POST",
		body: data ? JSON.stringify(data) : undefined,
		...config,
	});
}

/**
 * PUT 请求
 */
export async function put<T = any>(
	endpoint: string,
	data?: any,
	config?: RequestConfig,
): Promise<T> {
	return request<T>(endpoint, {
		method: "PUT",
		body: data ? JSON.stringify(data) : undefined,
		...config,
	});
}

/**
 * DELETE 请求
 */
export async function del<T = any>(
	endpoint: string,
	config?: RequestConfig,
): Promise<T> {
	return request<T>(endpoint, {
		method: "DELETE",
		...config,
	});
}
