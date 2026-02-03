import { container } from "@/core/di/DIContainer";
import { PaymentDatasourceImpl } from "../data/datasource/PaymentDatasource";
import { PaymentRepositoryImpl } from "../data/repositories/PaymentRepositoryImpl";
import { GetPaymentsUseCaseImpl } from "../domain/usecases/GetPaymentsUseCase";

// Symbols for dependency injection (using Symbol.for for hot reload compatibility)
export const PAYMENT_TOKENS = {
	PaymentDatasource: Symbol.for("PaymentDatasource"),
	PaymentRepository: Symbol.for("PaymentRepository"),
	GetPaymentsUseCase: Symbol.for("GetPaymentsUseCase"),
} as const;

export function paymentsConfigureContainer(): void {
	// Register datasource
	container.registerClass(
		PAYMENT_TOKENS.PaymentDatasource,
		PaymentDatasourceImpl,
		[]
	);

	// Register repository
	container.registerClass(
		PAYMENT_TOKENS.PaymentRepository,
		PaymentRepositoryImpl,
		[PAYMENT_TOKENS.PaymentDatasource]
	);

	// Register use cases
	container.registerClass(
		PAYMENT_TOKENS.GetPaymentsUseCase,
		GetPaymentsUseCaseImpl,
		[PAYMENT_TOKENS.PaymentRepository]
	);
}
