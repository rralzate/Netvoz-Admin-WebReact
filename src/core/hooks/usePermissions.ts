// Stub - permissions not used in this project
export interface RoleData {
	id: string;
	nombre: string;
	permisos: Record<string, unknown>;
}

export function usePermissions() {
	return {
		hasPermission: (_module: string, _action: string) => true,
		hasAnyPermission: (_module: string, _actions: string[]) => true,
		hasAllPermissions: (_module: string, _actions: string[]) => true,
		canAccessModule: (_module: string) => true,
		roleData: null as RoleData | null,
		isLoadingRole: false,
		reloadRole: async () => {},
	};
}

export function clearRoleCache() {}
