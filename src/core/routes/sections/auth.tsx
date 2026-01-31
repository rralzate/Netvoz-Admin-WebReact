import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";

const LoginPage = lazy(() => import("@/features/auth/presentation/pages"));
const PasswordResetPage = lazy(() => import("@/features/auth/presentation/pages/password-reset"));
const PrivacyPolicyPage = lazy(() => import("@/features/auth/presentation/pages/privacy-policy"));
const TermsAndConditionsPage = lazy(
	() => import("@/features/auth/presentation/pages/terms-and-conditions/TermsAndConditionsPage"),
);
const authCustom: RouteObject[] = [
	{
		path: "login",
		element: <LoginPage />,
	},
	{
		path: "password-reset",
		element: <PasswordResetPage />,
	},
	{
		path: "privacy-policy",
		element: <PrivacyPolicyPage />,
	},
	{
		path: "terms-and-conditions",
		element: <TermsAndConditionsPage />,
	},
];

export const authRoutes: RouteObject[] = [
	{
		path: "auth",
		element: (
			<Suspense>
				<Outlet />
			</Suspense>
		),
		children: [...authCustom],
	},
];
