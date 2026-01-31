import packageJson from "../package.json";

export type GlobalConfig = {
	appName: string;
	appVersion: string;
	defaultRoute: string;
	publicPath: string;
	apiBaseUrl: string;
	routerMode: "frontend" | "backend";
};

export const GLOBAL_CONFIG: GlobalConfig = {
	appName: "Netvoz Admin",
	appVersion: packageJson.version,
	defaultRoute: import.meta.env.VITE_APP_DEFAULT_ROUTE || (window as any).APP_CONFIG?.defaultRoute || "/workbench",
	publicPath: import.meta.env.VITE_APP_PUBLIC_PATH || (window as any).APP_CONFIG?.publicPath || "/",
	apiBaseUrl:
		import.meta.env.VITE_APP_API_BASE_URL ||
		(window as any).APP_CONFIG?.apiBaseUrl ||
		"https://netvozposapitest-fdhfeaekhthge8eh.eastus-01.azurewebsites.net/api/v1",
	routerMode: import.meta.env.VITE_APP_ROUTER_MODE || (window as any).APP_CONFIG?.routerMode || "frontend",
};
