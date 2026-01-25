import "./global.css";
import "./core/theme/theme.css";
import "./core/locales/i18n";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import App from "./App";
import { registerLocalIcons } from "./components/icon/register-icons";
import { configureContainer } from "./core/di/container.config";
import ErrorBoundary from "./core/routes/components/error-boundary";
import { routesSection } from "./core/routes/sections";
import { GLOBAL_CONFIG } from "./global-config";

configureContainer();

await registerLocalIcons();

const router = createBrowserRouter(
	[
		{
			Component: () => (
				<App>
					<Outlet />
				</App>
			),
			errorElement: <ErrorBoundary />,
			children: routesSection,
		},
	],
	{
		basename: GLOBAL_CONFIG.publicPath,
	},
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
