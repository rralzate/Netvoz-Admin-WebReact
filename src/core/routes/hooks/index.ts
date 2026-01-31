import { useNavigate, useParams as useReactRouterParams, useLocation } from "react-router";

/**
 * Custom router hook with navigation utilities
 */
export function useRouter() {
	const navigate = useNavigate();
	const location = useLocation();

	return {
		/**
		 * Navigate to a path
		 */
		push: (path: string) => navigate(path),

		/**
		 * Replace current history entry
		 */
		replace: (path: string) => navigate(path, { replace: true }),

		/**
		 * Go back in history
		 */
		back: () => navigate(-1),

		/**
		 * Go forward in history
		 */
		forward: () => navigate(1),

		/**
		 * Refresh current route
		 */
		refresh: () => navigate(0),

		/**
		 * Current pathname
		 */
		pathname: location.pathname,

		/**
		 * Current search params string
		 */
		search: location.search,

		/**
		 * Current hash
		 */
		hash: location.hash,

		/**
		 * Full location object
		 */
		location,
	};
}

/**
 * Custom params hook
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
	return useReactRouterParams() as T;
}

export { useLocation };
