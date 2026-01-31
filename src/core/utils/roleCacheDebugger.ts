import { roleCacheService } from "@/core/services/RoleCacheService";

/**
 * Utility functions for debugging role cache
 * Only available in development mode
 */
export const roleCacheDebugger = {
	/**
	 * Log cache statistics to console
	 */
	logCacheStats: () => {
		if (import.meta.env.DEV) {
			const stats = roleCacheService.getCacheStats();
			console.log("🔍 Role Cache Statistics:", {
				cachedRoles: stats.cachedRoles,
				loadingRoles: stats.loadingRoles,
				cacheKeys: stats.cacheKeys,
				timestamp: new Date().toISOString(),
			});
		}
	},

	/**
	 * Clear all cached roles
	 */
	clearCache: () => {
		if (import.meta.env.DEV) {
			roleCacheService.clearAll();
			console.log("🧹 Role cache cleared");
		}
	},

	/**
	 * Get cached role by ID
	 */
	getCachedRole: (roleId: string) => {
		if (import.meta.env.DEV) {
			const role = roleCacheService.getCachedRole(roleId);
			console.log(`🔍 Cached role for ID ${roleId}:`, role);
			return role;
		}
		return null;
	},

	/**
	 * Monitor cache performance
	 */
	startMonitoring: () => {
		if (import.meta.env.DEV) {
			console.log("🚀 Starting role cache monitoring...");

			// Log cache stats every 30 seconds
			const interval = setInterval(() => {
				roleCacheDebugger.logCacheStats();
			}, 30000);

			// Return cleanup function
			return () => {
				clearInterval(interval);
				console.log("🛑 Role cache monitoring stopped");
			};
		}
		return () => {};
	},
};

// Make debugger available globally in development
if (import.meta.env.DEV) {
	(window as any).roleCacheDebugger = roleCacheDebugger;
}
