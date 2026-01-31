import { useQuery } from "@tanstack/react-query";
import { container } from "@/core/di/DIContainer";
import { SUBSCRIPTION_TOKENS } from "../../di/subscriptions.container.config";
import type { SubscriptionStatus } from "../../domain/entities/SubscriptionEntity";
import type { GetSubscriptionsUseCase } from "../../domain/usecases";

export const useSubscriptions = (filters?: { status?: SubscriptionStatus; page?: number; pageSize?: number }) => {
	const getSubscriptionsUseCase = container.get<GetSubscriptionsUseCase>(SUBSCRIPTION_TOKENS.GetSubscriptionsUseCase);

	return useQuery({
		queryKey: ["subscriptions", filters],
		queryFn: () => getSubscriptionsUseCase.execute(filters),
	});
};
