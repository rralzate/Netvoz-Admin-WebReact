import { container } from "@/core/di/DIContainer";
import { SubscriptionDatasourceImpl } from "../data/datasource/SubscriptionDatasource";
import { SubscriptionRepositoryImpl } from "../data/repositories/SubscriptionRepositoryImpl";
import { GetSubscriptionsUseCaseImpl } from "../domain/usecases";

export const SUBSCRIPTION_TOKENS = {
	SubscriptionDatasource: Symbol("SubscriptionDatasource"),
	SubscriptionRepository: Symbol("SubscriptionRepository"),
	GetSubscriptionsUseCase: Symbol("GetSubscriptionsUseCase"),
} as const;

export function subscriptionsConfigureContainer(): void {
	// Register Datasources
	container.registerClass(SUBSCRIPTION_TOKENS.SubscriptionDatasource, SubscriptionDatasourceImpl, []);

	// Register Repositories
	container.registerClass(SUBSCRIPTION_TOKENS.SubscriptionRepository, SubscriptionRepositoryImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionDatasource,
	]);

	// Register Use Cases
	container.registerClass(SUBSCRIPTION_TOKENS.GetSubscriptionsUseCase, GetSubscriptionsUseCaseImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionRepository,
	]);
}
