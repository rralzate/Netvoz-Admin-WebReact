import { container } from "@/core/di/DIContainer";
import { WorkbenchDataSourceImpl } from "../data/datasource/WorkbenchDataSourceImpl";
import { WorkbenchRepositoryImpl } from "../data/repositories/WorkbenchRepositoryImpl";
import { GetWorkbenchDataUseCaseImpl } from "../domain/usecases";

// Service tokens
export const WORKBENCH_TOKENS = {
	// Datasources
	WorkbenchDataSource: Symbol("WorkbenchDataSource"),

	// Repositories
	WorkbenchRepository: Symbol("WorkbenchRepository"),

	// Use Cases
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
		WORKBENCH_TOKENS.GetWorkbenchDataUseCase,
		GetWorkbenchDataUseCaseImpl,
		[WORKBENCH_TOKENS.WorkbenchRepository], // Depends on WorkbenchRepository
	);
}
