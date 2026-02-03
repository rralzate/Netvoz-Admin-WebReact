import { container } from "@/core/di/DIContainer";
import { SubscriptionDatasourceImpl } from "../data/datasource/SubscriptionDatasource";
import { SubscriptionRepositoryImpl } from "../data/repositories/SubscriptionRepositoryImpl";
import {
	GetSubscriptionsUseCaseImpl,
	GetSubscriptionByIdUseCaseImpl,
	CreateSubscriptionUseCaseImpl,
	UpdateSubscriptionUseCaseImpl,
	DeleteSubscriptionUseCaseImpl,
} from "../domain/usecases";

export const SUBSCRIPTION_TOKENS = {
	SubscriptionDatasource: Symbol.for("SubscriptionDatasource"),
	SubscriptionRepository: Symbol.for("SubscriptionRepository"),
	GetSubscriptionsUseCase: Symbol.for("GetSubscriptionsUseCase"),
	GetSubscriptionByIdUseCase: Symbol.for("GetSubscriptionByIdUseCase"),
	CreateSubscriptionUseCase: Symbol.for("CreateSubscriptionUseCase"),
	UpdateSubscriptionUseCase: Symbol.for("UpdateSubscriptionUseCase"),
	DeleteSubscriptionUseCase: Symbol.for("DeleteSubscriptionUseCase"),
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

	container.registerClass(SUBSCRIPTION_TOKENS.GetSubscriptionByIdUseCase, GetSubscriptionByIdUseCaseImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionRepository,
	]);

	container.registerClass(SUBSCRIPTION_TOKENS.CreateSubscriptionUseCase, CreateSubscriptionUseCaseImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionRepository,
	]);

	container.registerClass(SUBSCRIPTION_TOKENS.UpdateSubscriptionUseCase, UpdateSubscriptionUseCaseImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionRepository,
	]);

	container.registerClass(SUBSCRIPTION_TOKENS.DeleteSubscriptionUseCase, DeleteSubscriptionUseCaseImpl, [
		SUBSCRIPTION_TOKENS.SubscriptionRepository,
	]);
}
