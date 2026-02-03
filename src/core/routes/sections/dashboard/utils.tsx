import { lazy, Suspense } from "react";
import { LineLoading } from "@/components/loading";

const Pages = {
	...import.meta.glob("/src/pages/**/*.tsx"),
	...import.meta.glob("/src/core/pages/**/*.tsx"),
	...import.meta.glob("/src/features/**/pages/**/*.tsx"),
};

// Debug: Log available pages in development
if (import.meta.env.DEV) {
	console.log("Available pages:", Object.keys(Pages));
}

const lazyComponentCache = new Map<string, React.LazyExoticComponent<any>>();

export const loadComponentFromPath = (path: string) => {
	const pathArr = path.split("/");
	pathArr.unshift("/src");

	if (!pathArr.includes(".tsx")) {
		return pathArr.push("index.tsx");
	}
	return Pages[pathArr.join("/")];
};

export const Component = (path = "", props?: any): React.ReactNode => {
	if (!path) return null;

	let importFn = Pages[`/src${path}.tsx`];
	if (!importFn) importFn = Pages[`/src${path}/index.tsx`];
	if (!importFn) {
		console.warn("Component not found for path:", path);
		console.warn("Available pages:", Object.keys(Pages));
		// Return a fallback component instead of null to prevent 404 redirect
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Página no encontrada</h3>
					<p className="text-gray-600 mb-4">
						No se pudo cargar el componente: {path}
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Recargar página
					</button>
				</div>
			</div>
		);
	}

	let Element = lazyComponentCache.get(path);
	if (!Element) {
		Element = lazy(async (): Promise<{ default: React.ComponentType<any> }> => {
			try {
				return (await importFn()) as Promise<{ default: React.ComponentType<any> }>;
			} catch (error: any) {
				console.error(`Failed to load component ${path}:`, error);

				// Check if it's a network/module loading error
				const isNetworkError =
					error?.message?.includes("Failed to fetch dynamically imported module") ||
					error?.message?.includes("Loading chunk") ||
					error?.message?.includes("NetworkError") ||
					error?.message?.includes("fetch");

				if (isNetworkError) {
					// Return a retry component for network errors
					return {
						default: () => (
							<div className="flex items-center justify-center p-8">
								<div className="text-center">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">Network Error</h3>
									<p className="text-gray-600 mb-4">
										Failed to load the requested page. This might be due to a network issue or an application update.
									</p>
									<div className="space-x-2">
										<button
											type="button"
											onClick={() => {
												// Clear the cache for this component and retry
												lazyComponentCache.delete(path);
												window.location.reload();
											}}
											className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
										>
											Retry
										</button>
										<button
											type="button"
											onClick={() => {
												// Clear all caches and reload
												if ("caches" in window) {
													caches.keys().then((names) => {
														names.forEach((name) => caches.delete(name));
													});
												}
												lazyComponentCache.clear();
												window.location.reload();
											}}
											className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
										>
											Clear Cache & Retry
										</button>
									</div>
								</div>
							</div>
						),
					};
				}

				// Return a fallback component for other errors
				return {
					default: () => (
						<div className="flex items-center justify-center p-8">
							<div className="text-center">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading component</h3>
								<p className="text-gray-600 mb-4">Failed to load the requested page. Please refresh the page.</p>
								<button
									type="button"
									onClick={() => window.location.reload()}
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									Refresh Page
								</button>
							</div>
						</div>
					),
				};
			}
		});
		lazyComponentCache.set(path, Element);
	}

	// Sanitize props to prevent object to primitive conversion errors
	const sanitizedProps = props ? sanitizeProps(props) : {};

	return (
		<Suspense fallback={<LineLoading />}>
			<Element {...sanitizedProps} />
		</Suspense>
	);
};

// Helper function to sanitize props and prevent object to primitive conversion errors
const sanitizeProps = (props: any): any => {
	if (!props || typeof props !== "object") return props;

	const sanitized: any = {};

	for (const [key, value] of Object.entries(props)) {
		try {
			// Only include primitive values or objects that can be safely serialized
			if (value === null || value === undefined) {
				sanitized[key] = value;
			} else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
				sanitized[key] = value;
			} else if (Array.isArray(value)) {
				sanitized[key] = value.map((item) => (typeof item === "object" ? sanitizeProps(item) : item));
			} else if (typeof value === "object") {
				// For objects, try to convert to string safely
				try {
					// Test if the object can be converted to string
					String(value);
					sanitized[key] = value;
				} catch (error) {
					console.warn(`Skipping prop ${key} due to conversion error:`, error);
					// Skip this prop to prevent errors
				}
			} else {
				// For other types, try to convert to string
				try {
					sanitized[key] = String(value);
				} catch (error) {
					console.warn(`Converting prop ${key} to string failed:`, error);
					sanitized[key] = "";
				}
			}
		} catch (error) {
			console.warn(`Error sanitizing prop ${key}:`, error);
			// Skip this prop to prevent errors
		}
	}

	return sanitized;
};
