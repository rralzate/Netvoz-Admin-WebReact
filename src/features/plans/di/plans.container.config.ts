import { container } from "@/core/di/DIContainer";
import { PlanDatasourceImpl } from "../data/datasource/PlanDatasource";
import { PlanRepositoryImpl } from "../data/repositories/PlanRepositoryImpl";
import {
	GetPlansUseCaseImpl,
	GetPlanByIdUseCaseImpl,
	CreatePlanUseCaseImpl,
	UpdatePlanUseCaseImpl,
	DeletePlanUseCaseImpl,
} from "../domain/usecases";

export const PLAN_TOKENS = {
	PlanDatasource: Symbol.for("PlanDatasource"),
	PlanRepository: Symbol.for("PlanRepository"),
	GetPlansUseCase: Symbol.for("GetPlansUseCase"),
	GetPlanByIdUseCase: Symbol.for("GetPlanByIdUseCase"),
	CreatePlanUseCase: Symbol.for("CreatePlanUseCase"),
	UpdatePlanUseCase: Symbol.for("UpdatePlanUseCase"),
	DeletePlanUseCase: Symbol.for("DeletePlanUseCase"),
} as const;

export function plansConfigureContainer(): void {
	// Datasource
	container.registerClass(PLAN_TOKENS.PlanDatasource, PlanDatasourceImpl, []);

	// Repository
	container.registerClass(PLAN_TOKENS.PlanRepository, PlanRepositoryImpl, [
		PLAN_TOKENS.PlanDatasource,
	]);

	// Use Cases
	container.registerClass(PLAN_TOKENS.GetPlansUseCase, GetPlansUseCaseImpl, [
		PLAN_TOKENS.PlanRepository,
	]);

	container.registerClass(PLAN_TOKENS.GetPlanByIdUseCase, GetPlanByIdUseCaseImpl, [
		PLAN_TOKENS.PlanRepository,
	]);

	container.registerClass(PLAN_TOKENS.CreatePlanUseCase, CreatePlanUseCaseImpl, [
		PLAN_TOKENS.PlanRepository,
	]);

	container.registerClass(PLAN_TOKENS.UpdatePlanUseCase, UpdatePlanUseCaseImpl, [
		PLAN_TOKENS.PlanRepository,
	]);

	container.registerClass(PLAN_TOKENS.DeletePlanUseCase, DeletePlanUseCaseImpl, [
		PLAN_TOKENS.PlanRepository,
	]);
}
