import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { GLOBAL_CONFIG } from "@/global-config";

interface RequestOptions<D = any> {
	url: string;
	data?: D;
	config?: AxiosRequestConfig;
}

class ApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: GLOBAL_CONFIG.apiBaseUrl,
			timeout: 30000,
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.setupInterceptors();
	}

	private getAccessToken(): string | null {
		try {
			// Token is stored by Zustand persist middleware under "userStore" key
			const stored = localStorage.getItem("userStore");
			if (stored) {
				const parsed = JSON.parse(stored);
				// Zustand persist stores state in a "state" property
				return parsed.state?.userToken?.accessToken || parsed.userToken?.accessToken || null;
			}
			return null;
		} catch (error) {
			console.warn("Error reading auth token from storage:", error);
			return null;
		}
	}

	private clearAuthStorage() {
		try {
			const stored = localStorage.getItem("userStore");
			if (stored) {
				const parsed = JSON.parse(stored);
				// Clear only the token, preserve other state
				if (parsed.state) {
					parsed.state.userToken = {};
					parsed.state.userInfo = {};
				} else {
					parsed.userToken = {};
					parsed.userInfo = {};
				}
				localStorage.setItem("userStore", JSON.stringify(parsed));
			}
		} catch (error) {
			// If parsing fails, remove the entire store
			localStorage.removeItem("userStore");
		}
	}

	private setupInterceptors() {
		this.client.interceptors.request.use(
			(config) => {
				// Add auth token if available
				const token = this.getAccessToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

		this.client.interceptors.response.use(
			(response) => response.data,
			(error) => {
				if (error.response?.status === 401) {
					// Handle unauthorized - clear auth storage and redirect to login
					this.clearAuthStorage();
					window.location.href = "/auth/login";
				}
				return Promise.reject(error);
			},
		);
	}

	public async get<T = any>(options: RequestOptions): Promise<T> {
		return this.client.get<T, T>(options.url, options.config);
	}

	public async post<T = any>(options: RequestOptions): Promise<T> {
		return this.client.post<T, T>(options.url, options.data, options.config);
	}

	public async put<T = any>(options: RequestOptions): Promise<T> {
		return this.client.put<T, T>(options.url, options.data, options.config);
	}

	public async delete<T = any>(options: RequestOptions): Promise<T> {
		return this.client.delete<T, T>(options.url, options.config);
	}
}

export const apiClient = new ApiClient();
export default apiClient;
