// Stub - permissions not used in this project (always grants access)
export function usePermissionCheck(_options?: unknown) {
	return {
		hasAccess: true,
		isLoading: false,
		// Clientes permissions (all return true)
		canCreateClient: () => true,
		canEditClient: () => true,
		canDeleteClient: () => true,
		canRealizarAbonos: () => true,
	};
}

export function useCanPerform(_module?: string, _action?: string) {
	return true;
}

export function useCRUDPermissions(_module?: string) {
	return { canCreate: true, canEdit: true, canDelete: true, isLoading: false };
}
