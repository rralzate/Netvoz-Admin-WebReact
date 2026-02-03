import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { LineLoading } from "@/components/loading";
import SimpleLayout from "@/core/layouts/simple";

const Page403 = lazy(() => import("@/core/pages/sys/error/Page403"));
const Page404 = lazy(() => import("@/core/pages/sys/error/Page404"));
const Page500 = lazy(() => import("@/core/pages/sys/error/Page500"));

export const mainRoutes: RouteObject[] = [
	{
		path: "/500",
		element: (
			<SimpleLayout>
				<Suspense fallback={<LineLoading />}>
					<Page500 />
				</Suspense>
			</SimpleLayout>
		),
	},
	{
		path: "/404",
		element: (
			<SimpleLayout>
				<Suspense fallback={<LineLoading />}>
					<Page404 />
				</Suspense>
			</SimpleLayout>
		),
	},
	{
		path: "/403",
		element: (
			<SimpleLayout>
				<Suspense fallback={<LineLoading />}>
					<Page403 />
				</Suspense>
			</SimpleLayout>
		),
	},
];
