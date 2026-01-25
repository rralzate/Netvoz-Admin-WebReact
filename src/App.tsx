import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AntdAdapter } from "./core/theme/adapter/antd.adapter";
import { ThemeProvider } from "./core/theme/theme-provider";
import { GLOBAL_CONFIG } from "./global-config";

function App({ children }: { children: React.ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
				gcTime: 10 * 60 * 1000,
			},
		},
	});

	return (
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider adapters={[AntdAdapter]}>
					<Helmet>
						<title>{GLOBAL_CONFIG.appName}</title>
					</Helmet>
					{children}
				</ThemeProvider>
			</QueryClientProvider>
		</HelmetProvider>
	);
}

export default App;
