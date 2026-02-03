import type {
	PaymentEntity,
	PaymentListResponse,
	PaymentStatus,
} from "../../domain/entities/PaymentEntity";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import type { PaymentDatasource } from "../datasource/PaymentDatasource";

export class PaymentRepositoryImpl implements PaymentRepository {
	constructor(private readonly datasource: PaymentDatasource) {}

	async getAll(filters?: {
		status?: PaymentStatus;
		page?: number;
		pageSize?: number;
	}): Promise<PaymentListResponse> {
		return this.datasource.getAll(filters);
	}

	async getById(id: string): Promise<PaymentEntity> {
		return this.datasource.getById(id);
	}

	async retry(id: string): Promise<PaymentEntity> {
		return this.datasource.retry(id);
	}

	async confirm(id: string): Promise<PaymentEntity> {
		return this.datasource.confirm(id);
	}
}
