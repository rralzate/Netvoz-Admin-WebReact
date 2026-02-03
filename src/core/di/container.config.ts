// Dependency Injection container configuration
import { authConfigureContainer } from "@/features/auth/di/auth.container.config";
import { subscriptionsConfigureContainer } from "@/features/subscriptions/di/subscriptions.container.config";
import { plansConfigureContainer } from "@/features/plans/di/plans.container.config";
import { paymentsConfigureContainer } from "@/features/payments/di/payments.container.config";

export function configureContainer() {
	// Configure auth module
	authConfigureContainer();

	// Configure subscriptions module
	subscriptionsConfigureContainer();

	// Configure plans module
	plansConfigureContainer();

	// Configure payments module
	paymentsConfigureContainer();
}
