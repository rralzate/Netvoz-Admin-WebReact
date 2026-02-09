import { container } from "@/core/di/DIContainer";
import { WorkbenchDataSourceImpl } from "../data/datasource/WorkbenchDataSourceImpl";
import { WorkbenchRepositoryImpl } from "../data/repositories/WorkbenchRepositoryImpl";
import {
	GetOrdersByHourUseCaseImpl,
	GetRevenueLast7DaysUseCaseImpl,
	GetTop5ProductsThisMonthUseCaseImpl,
	GetTotalRevenueUseCaseImpl,
	GetWorkbenchDataUseCaseImpl,
} from "../domain/usecases";

// Service tokens (símbolos únicos para evitar colisiones)
export const WORKBENCH_TOKENS = {
	// Datasources
	WorkbenchDataSource: Symbol("WorkbenchDataSource"),

	// Repositories
	WorkbenchRepository: Symbol("WorkbenchRepository"),

	// Use Cases
	GetOrdersByHourUseCase: Symbol("GetOrdersByHourUseCase"),
	GetRevenueLast7DaysUseCase: Symbol("GetRevenueLast7DaysUseCase"),
	GetTotalRevenueUseCase: Symbol("GetTotalRevenueUseCase"),
	GetTop5ProductsThisMonthUseCase: Symbol("GetTop5ProductsThisMonthUseCase"),
	GetWorkbenchDataUseCase: Symbol("GetWorkbenchDataUseCase"),
} as const;

export function workbenchConfigureContainer(): void {
	// Register Datasources
	container.registerClass(
		WORKBENCH_TOKENS.WorkbenchDataSource,
		WorkbenchDataSourceImpl,
		[], // No dependencies
	);

	// Register Repositories
	container.registerClass(
		WORKBENCH_TOKENS.WorkbenchRepository,
		WorkbenchRepositoryImpl,
		[WORKBENCH_TOKENS.WorkbenchDataSource], // Depends on WorkbenchDataSource
	);

	// Register Use Cases
	container.registerClass(
		WORKBENCH_TOKENS.GetOrdersByHourUseCase,
		GetOrdersByHourUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);

	container.registerClass(
		WORKBENCH_TOKENS.GetRevenueLast7DaysUseCase,
		GetRevenueLast7DaysUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);

	container.registerClass(
		WORKBENCH_TOKENS.GetTotalRevenueUseCase,
		GetTotalRevenueUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);

	container.registerClass(
		WORKBENCH_TOKENS.GetTop5ProductsThisMonthUseCase,
		GetTop5ProductsThisMonthUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);

	container.registerClass(
		WORKBENCH_TOKENS.GetWorkbenchDataUseCase,
		GetWorkbenchDataUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);
}
