import { Navigate, type RouteObject } from "react-router";
import { subscriptionsRoutes } from "./subscriptions";

export const routesSection: RouteObject[] = [
	...subscriptionsRoutes,
	{ path: "*", element: <Navigate to="/subscriptions" replace /> },
];
