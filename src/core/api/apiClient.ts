import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { GLOBAL_CONFIG } from "@/global-config";

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

	private setupInterceptors() {
		this.client.interceptors.request.use(
			(config) => {
				// Add auth token if available
				const token = localStorage.getItem("userToken");
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
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// Handle unauthorized
					localStorage.removeItem("userToken");
					window.location.href = "/login";
				}
				return Promise.reject(error);
			},
		);
	}

	public get<T = any>(url: string, config?: AxiosRequestConfig) {
		return this.client.get<T>(url, config);
	}

	public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.client.post<T>(url, data, config);
	}

	public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.client.put<T>(url, data, config);
	}

	public delete<T = any>(url: string, config?: AxiosRequestConfig) {
		return this.client.delete<T>(url, config);
	}
}

export const apiClient = new ApiClient();
