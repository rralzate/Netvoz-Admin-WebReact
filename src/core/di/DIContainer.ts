// Simple Dependency Injection Container

type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = () => T;

interface Registration {
	type: "class" | "instance" | "factory";
	value: any;
	dependencies?: symbol[];
	singleton?: boolean;
	instance?: any;
}

class DIContainer {
	private registrations = new Map<symbol, Registration>();

	/**
	 * Register a class with its dependencies
	 */
	registerClass<T>(
		token: symbol,
		constructor: Constructor<T>,
		dependencies: symbol[] = [],
		singleton = true,
	): void {
		this.registrations.set(token, {
			type: "class",
			value: constructor,
			dependencies,
			singleton,
		});
	}

	/**
	 * Register a singleton instance
	 */
	registerInstance<T>(token: symbol, instance: T): void {
		this.registrations.set(token, {
			type: "instance",
			value: instance,
			instance: instance,
		});
	}

	/**
	 * Register a factory function
	 */
	registerFactory<T>(token: symbol, factory: Factory<T>, singleton = true): void {
		this.registrations.set(token, {
			type: "factory",
			value: factory,
			singleton,
		});
	}

	/**
	 * Get an instance from the container
	 */
	get<T>(token: symbol): T {
		const registration = this.registrations.get(token);

		if (!registration) {
			throw new Error(`No registration found for token: ${token.toString()}`);
		}

		// Return cached singleton instance if available
		if (registration.singleton && registration.instance !== undefined) {
			return registration.instance;
		}

		let instance: T;

		switch (registration.type) {
			case "instance":
				return registration.value as T;

			case "factory":
				instance = registration.value();
				break;

			case "class":
				// Resolve dependencies recursively
				const deps = (registration.dependencies || []).map((dep) => this.get(dep));
				instance = new registration.value(...deps);
				break;

			default:
				throw new Error(`Unknown registration type`);
		}

		// Cache singleton instance
		if (registration.singleton) {
			registration.instance = instance;
		}

		return instance;
	}

	/**
	 * Check if a token is registered
	 */
	has(token: symbol): boolean {
		return this.registrations.has(token);
	}

	/**
	 * Clear all registrations
	 */
	clear(): void {
		this.registrations.clear();
	}

	/**
	 * Remove a specific registration
	 */
	remove(token: symbol): boolean {
		return this.registrations.delete(token);
	}
}

// Export a singleton container instance
export const container = new DIContainer();

// Export the class for testing or multiple container scenarios
export { DIContainer };
