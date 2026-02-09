import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/core/ui/button";
import { Skeleton } from "@/core/ui/skeleton";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";
import { KPICard } from "../components/KPICard";
import { OrdersByHourChart } from "../components/OrdersByHourChart";
import { RevenueLast7DaysChart } from "../components/RevenueLast7DaysChart";
import { Top5ProductsChart } from "../components/Top5ProductsChart";
import { useWorkbench } from "../hooks/useWorkbench";
import { useWorkbenchAutoRefresh } from "../hooks/useWorkbenchAutoRefresh";

export function WorkbenchPage() {
	const { t } = useTranslation();
	// Get real business ID from logged in user
	const { negocioId } = useUserInfo();
	const { data: workbenchData, isLoading, error, refetch, isRefetching } = useWorkbench(negocioId || "");

	// Auto-refresh when user changes (login/logout)
	useWorkbenchAutoRefresh(refetch);

	const handleRefresh = () => {
		refetch();
	};

	// Show loading state when no businessId is available
	if (!negocioId) {
		return (
			<div className="p-6">
				<div className="text-center text-muted-foreground">{t("sys.workbench.noBusinessInfo")}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center space-y-4">
					<div className="text-destructive">{t("sys.workbench.loadError")}</div>
					<Button onClick={handleRefresh} variant="outline">
						<RefreshCw className="w-4 h-4 mr-2" />
						{t("sys.workbench.retry")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with refresh button */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 pb-0">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold">{t("sys.workbench.title")}</h1>
					<p className="text-sm sm:text-base text-muted-foreground">{t("sys.workbench.subtitle")}</p>
				</div>
				<Button
					onClick={handleRefresh}
					variant="outline"
					disabled={isRefetching}
					className="flex items-center gap-2 w-full sm:w-auto"
				>
					<RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
					{isRefetching ? t("sys.workbench.refreshing") : t("sys.workbench.refreshButton")}
				</Button>
			</div>

			<div className="p-4 sm:p-6 space-y-6">
				{/* KPI Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{isLoading ? (
						<>
							<Skeleton className="h-32" />
							<Skeleton className="h-32" />
							<Skeleton className="h-32" />
						</>
					) : (
						<>
							<KPICard
								title={t("sys.workbench.kpis.facturadoHoy.title")}
								amount={workbenchData?.kpis.facturadoHoy.amount || 0}
								objective={workbenchData?.kpis.facturadoHoy.objective || 0}
								percentage={workbenchData?.kpis.facturadoHoy.percentage || 0}
								period={t("sys.workbench.kpis.facturadoHoy.period")}
							/>
							<KPICard
								title={t("sys.workbench.kpis.ultimos7Dias.title")}
								amount={workbenchData?.kpis.ultimos7Dias.amount || 0}
								objective={workbenchData?.kpis.ultimos7Dias.objective || 0}
								percentage={workbenchData?.kpis.ultimos7Dias.percentage || 0}
								period={t("sys.workbench.kpis.ultimos7Dias.period")}
							/>
							<KPICard
								title={t("sys.workbench.kpis.ultimos30Dias.title")}
								amount={workbenchData?.kpis.ultimos30Dias.amount || 0}
								objective={workbenchData?.kpis.ultimos30Dias.objective || 0}
								percentage={workbenchData?.kpis.ultimos30Dias.percentage || 0}
								period={t("sys.workbench.kpis.ultimos30Dias.period")}
							/>
						</>
					)}
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					{/* Orders by Hour Chart */}
					<OrdersByHourChart data={workbenchData?.ordersByHour || []} isLoading={isLoading} />

					{/* Revenue Last 7 Days Chart */}
					<RevenueLast7DaysChart data={workbenchData?.revenueLast7Days || []} isLoading={isLoading} />
				</div>

				{/* Top 5 Products Chart */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					<Top5ProductsChart data={workbenchData?.top5Products || []} isLoading={isLoading} />

					{/* Additional space for future charts */}
					<div className="hidden lg:block"></div>
				</div>
			</div>
		</div>
	);
}
