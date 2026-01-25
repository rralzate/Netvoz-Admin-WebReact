import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_PUBLIC_PATH || "/";
	const isProduction = mode === "production";
	const enableProxy = env.VITE_APP_ENABLE_PROXY === "true";
	const apiBaseUrl = env.VITE_APP_API_BASE_URL;

	return {
		base,
		plugins: [
			react(),
			vanillaExtractPlugin({
				identifiers: ({ debugId }) => `${debugId}`,
			}),
			tailwindcss(),
			tsconfigPaths(),

			isProduction &&
				visualizer({
					open: true,
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
		].filter(Boolean),

		server: {
			open: true,
			host: true,
			port: 3001,
			// Only use proxy if explicitly enabled and in development
			...(enableProxy &&
				!isProduction && {
					proxy: {
						"/api": {
							target: "https://netvozposapitest-fdhfeaekhthge8eh.eastus-01.azurewebsites.net",
							changeOrigin: true,
							secure: true,
							rewrite: (path) => `/api/v1${path.replace(/^\/api/, "")}`,
							configure: (proxy, _options) => {
								proxy.on("error", (_err, _req, res) => {
									if (!res.headersSent) {
										res.writeHead(200, { "Content-Type": "application/json" });
										res.end(
											JSON.stringify({
												success: true,
												message: "Mock response (proxy error)",
												data: null,
											}),
										);
									}
								});
							},
						},
					},
				}),
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			sourcemap: !isProduction,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router"],
						"vendor-ui": ["antd", "@ant-design/cssinjs", "styled-components"],
						"vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
					chunkFileNames: () => {
						return `assets/[name]-[hash].js`;
					},
					entryFileNames: "assets/[name]-[hash].js",
					assetFileNames: "assets/[name]-[hash].[ext]",
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router", "antd", "axios", "dayjs"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},

		define: {
			__DEV__: JSON.stringify(!isProduction),
			__API_BASE_URL__: JSON.stringify(apiBaseUrl),
		},
	};
});
