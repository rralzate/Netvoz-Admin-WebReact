// Stub - permissions not used in this project
export function useNavigationPermissions() {
	return {
		isRouteAccessible: () => true,
		isLoadingPermissions: false,
		accessibleRoutes: [] as string[],
	};
}
