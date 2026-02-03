import type { PaymentEntity, PaymentListResponse, PaymentStatus } from "../entities/PaymentEntity";

export interface PaymentRepository {
	getAll(filters?: { status?: PaymentStatus; page?: number; pageSize?: number }): Promise<PaymentListResponse>;
	getById(id: string): Promise<PaymentEntity>;
	retry(id: string): Promise<PaymentEntity>;
	confirm(id: string): Promise<PaymentEntity>;
}
