// Dependency Injection container configuration
import { authConfigureContainer } from "@/features/auth/di/auth.container.config";
import { subscriptionsConfigureContainer } from "@/features/subscriptions/di/subscriptions.container.config";

export function configureContainer() {
	// Configure auth module
	authConfigureContainer();

	// Configure subscriptions module
	subscriptionsConfigureContainer();
}
