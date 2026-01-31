import { useUserInfo, useUserToken } from "@/features/auth/presentation/hooks/userStore";

/**
 * permission/role check hook
 * @param baseOn - check type: 'role' or 'permission'
 *
 * @example
 * // permission check
 * const { check, checkAny, checkAll } = useAuthCheck('permission');
 * check('user.create')
 * checkAny(['user.create', 'user.edit'])
 * checkAll(['user.create', 'user.edit'])
 *
 * @example
 * // role check
 * const { check, checkAny, checkAll } = useAuthCheck('role');
 * check('admin')
 * checkAny(['admin', 'editor'])
 * checkAll(['admin', 'editor'])
 */
export const useAuthCheck = (_baseOn: "role" | "permission" = "permission") => {
	const { accessToken } = useUserToken();
	const { rolId } = useUserInfo();

	// check if item exists (simplified - always returns true if authenticated)
	const check = (_item: string): boolean => {
		// if user is not logged in, return false
		if (!accessToken || !rolId) {
			return false;
		}
		// For now, return true if authenticated - actual permission checking is done in usePermissions
		return true;
	};

	// check if any item exists
	const checkAny = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.some((item) => check(item));
	};

	// check if all items exist
	const checkAll = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.every((item) => check(item));
	};

	return { check, checkAny, checkAll };
};
