import type React from "react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { usePermissions } from "@/core/hooks/usePermissions";
import type { PermissionSystem } from "@/core/types/permissions";

interface PermissionRouteGuardProps {
	children: React.ReactNode;
	requiredModule: keyof PermissionSystem;
	requiredAction?: string;
	requiredActions?: string[];
	requireAll?: boolean;
	redirectTo?: string;
}

export const PermissionRouteGuard: React.FC<PermissionRouteGuardProps> = ({
	children,
	requiredModule,
	requiredAction,
	requiredActions,
	requireAll = false,
	redirectTo = "/403",
}) => {
	const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessModule, isLoadingRole, roleData } =
		usePermissions();
	const navigate = useNavigate();

	const hasAccess = useMemo(() => {
		// Si aún está cargando, no evaluar permisos todavía
		if (isLoadingRole) {
			return null; // null = loading state
		}

		// Verificación adicional: si no está cargando pero roleData es null, esperar
		if (!roleData) {
			return null; // null = waiting for roleData
		}

		if (!canAccessModule(requiredModule)) {
			return false;
		}

		if (requiredAction) {
			return hasPermission(requiredModule, requiredAction);
		}

		if (requiredActions) {
			return requireAll
				? hasAllPermissions(requiredModule, requiredActions)
				: hasAnyPermission(requiredModule, requiredActions);
		}

		return true;
	}, [
		requiredModule,
		requiredAction,
		requiredActions,
		requireAll,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		canAccessModule,
		isLoadingRole,
		roleData,
	]);

	useEffect(() => {
		// Solo redirigir si ya terminó de cargar Y no tiene acceso
		if (hasAccess === false) {
			navigate(redirectTo, { replace: true });
		}
	}, [hasAccess, navigate, redirectTo]);

	// Mientras está cargando, mostrar null (podrías poner un loading spinner aquí)
	if (hasAccess === null) {
		return null;
	}

	// Si tiene acceso, mostrar el contenido
	return hasAccess ? children : null;
};
