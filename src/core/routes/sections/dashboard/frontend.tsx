import type { RouteObject } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{
			path: "workbench",
			element: Component("/features/workbench/presentation/pages/WorkbenchPage"),
		},
		{
			path: "subscriptions",
			element: Component("/features/subscriptions/presentation/pages/subscriptions"),
		},
		{
			path: "subscriptions/:id",
			element: Component("/features/subscriptions/presentation/pages/subscriptions/detail"),
		},
		{
			path: "plans",
			element: Component("/features/plans/presentation/pages/PlansPage"),
		},
		{
			path: "payments",
			element: Component("/features/payments/presentation/pages/PaymentsPage"),
		},
	];
	return frontendDashboardRoutes;
}
