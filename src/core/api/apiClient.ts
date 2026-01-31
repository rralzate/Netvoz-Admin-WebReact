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
			(response) => response.data,
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
