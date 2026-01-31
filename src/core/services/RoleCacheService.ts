// Stub - Role cache not used (no permissions system)
class RoleCacheService {
	private cache = new Map<string, unknown>();
	private loading = new Set<string>();

	get(key: string) {
		return this.cache.get(key);
	}

	set(key: string, value: unknown) {
		this.cache.set(key, value);
	}

	clear() {
		this.cache.clear();
	}

	clearAll() {
		this.cache.clear();
		this.loading.clear();
	}

	has(key: string) {
		return this.cache.has(key);
	}

	getCacheStats() {
		return {
			cachedRoles: this.cache.size,
			loadingRoles: this.loading.size,
			cacheKeys: Array.from(this.cache.keys()),
		};
	}

	getCachedRole(roleId: string) {
		return this.cache.get(roleId) || null;
	}
}

export const roleCacheService = new RoleCacheService();
export default roleCacheService;
