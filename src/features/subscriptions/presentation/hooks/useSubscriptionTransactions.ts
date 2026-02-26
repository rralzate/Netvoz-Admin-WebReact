import { useCallback, useEffect, useState } from "react";
import { container } from "@/core/di/DIContainer";
import { SUBSCRIPTION_TOKENS } from "../../di/subscriptions.container.config";
import type { SubscriptionDatasource } from "../../data/datasource/SubscriptionDatasource";
import type { SubscriptionTransactionEntity } from "../../domain/entities/SubscriptionEntity";

const DEFAULT_LIMIT = 10;

export interface UseSubscriptionTransactionsReturn {
	transactions: SubscriptionTransactionEntity[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	isLoading: boolean;
	error: string | null;
	loadTransactions: (page?: number) => Promise<void>;
	setPage: (page: number) => void;
}

export function useSubscriptionTransactions(
	negocioId: string | undefined,
	options?: { limit?: number; enabled?: boolean }
): UseSubscriptionTransactionsReturn {
	const limit = options?.limit ?? DEFAULT_LIMIT;
	const enabled = options?.enabled !== false;

	const [transactions, setTransactions] = useState<SubscriptionTransactionEntity[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPageState] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTransactions = useCallback(
		async (pageNum?: number) => {
			if (!negocioId) {
				setTransactions([]);
				setTotal(0);
				setTotalPages(0);
				return;
			}
			try {
				setIsLoading(true);
				setError(null);
				const datasource = container.get<SubscriptionDatasource>(SUBSCRIPTION_TOKENS.SubscriptionDatasource);
				const res = await datasource.getTransactionsByBusiness(negocioId, {
					page: pageNum ?? page,
					limit,
				});
				setTransactions(res.data);
				setTotal(res.total);
				setPageState(res.page);
				setTotalPages(res.totalPages);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Error al cargar las transacciones";
				setError(message);
				setTransactions([]);
				setTotal(0);
				setTotalPages(0);
			} finally {
				setIsLoading(false);
			}
		},
		[negocioId, limit, page]
	);

	const setPage = useCallback((p: number) => {
		setPageState(p);
	}, []);

	useEffect(() => {
		if (enabled && negocioId) {
			loadTransactions(page);
		} else if (!negocioId) {
			setTransactions([]);
			setTotal(0);
			setTotalPages(0);
		}
	}, [negocioId, enabled, page, loadTransactions]);

	return {
		transactions,
		total,
		page,
		limit,
		totalPages,
		isLoading,
		error,
		loadTransactions,
		setPage,
	};
}

export default useSubscriptionTransactions;
