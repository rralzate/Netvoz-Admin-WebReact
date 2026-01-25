/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_DEFAULT_ROUTE: string;
	readonly VITE_APP_PUBLIC_PATH: string;
	readonly VITE_APP_API_BASE_URL: string;
	readonly VITE_APP_ROUTER_MODE: "frontend" | "backend";
	readonly VITE_APP_ENABLE_MOCK: string;
	readonly VITE_APP_ENABLE_PROXY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
