import { type RouteObject } from "react-router";
import { SubscriptionsPage } from "@/features/subscriptions/presentation/pages/subscriptions";

export const subscriptionsRoutes: RouteObject[] = [
	{
		path: "/subscriptions",
		element: <SubscriptionsPage />,
	},
];
