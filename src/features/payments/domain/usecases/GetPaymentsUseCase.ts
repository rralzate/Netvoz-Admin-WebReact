import type { PaymentListResponse, PaymentStatus } from "../entities/PaymentEntity";
import type { PaymentRepository } from "../repositories/PaymentRepository";

export interface GetPaymentsUseCase {
	execute(filters?: { status?: PaymentStatus; page?: number; pageSize?: number; rango?: string }): Promise<PaymentListResponse>;
}

export class GetPaymentsUseCaseImpl implements GetPaymentsUseCase {
	constructor(private readonly repository: PaymentRepository) {}

	async execute(filters?: { status?: PaymentStatus; page?: number; pageSize?: number; rango?: string }): Promise<PaymentListResponse> {
		return this.repository.getAll(filters);
	}
}
