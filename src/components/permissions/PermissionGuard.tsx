import type React from "react";
import type { PermissionGuardProps } from "@/core/types/permissions";

// Stub - permissions not used, always render children
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
	return children;
};
