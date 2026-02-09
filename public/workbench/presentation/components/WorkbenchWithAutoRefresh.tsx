import { RefreshCw } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";
import { useGetWorkbenchData, useWorkbenchAutoRefreshAdvanced, useWorkbenchMutations } from "../hooks";

/**
 * Componente que demuestra el uso del auto-refresh avanzado con los nuevos hooks
 */
export const WorkbenchWithAutoRefresh = () => {
	const { negocioId } = useUserInfo();
	const { data: workbenchData, isLoading, error, refetch } = useGetWorkbenchData(negocioId || "");
	const { refreshOrdersByHour, refreshRevenueLast7Days, isAnyLoading } = useWorkbenchMutations();
	const { invalidateAllWorkbenchQueries, clearAllWorkbenchQueries } = useWorkbenchAutoRefreshAdvanced();

	// El auto-refresh avanzado se ejecuta automáticamente
	// No necesitamos llamar useWorkbenchAutoRefresh aquí porque useWorkbenchAutoRefreshAdvanced
	// maneja todas las queries del workbench automáticamente

	const handleRefreshAll = () => {
		refetch();
	};

	const handleInvalidateQueries = () => {
		invalidateAllWorkbenchQueries();
	};

	const handleClearQueries = () => {
		clearAllWorkbenchQueries();
	};

	const handleRefreshOrdersByHour = () => {
		if (negocioId) {
			refreshOrdersByHour.mutate({
				businessId: negocioId,
				targetDate: new Date(),
				options: { lastHours: 12 },
			});
		}
	};

	const handleRefreshRevenue = () => {
		refreshRevenueLast7Days.mutate();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Cargando datos del dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center space-y-4">
					<p className="text-destructive">Error al cargar los datos del dashboard</p>
					<Button onClick={handleRefreshAll}>Reintentar</Button>
				</div>
			</div>
		);
	}

	if (!workbenchData) {
		return (
			<div className="flex items-center justify-center p-8">
				<p>No hay datos disponibles</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Dashboard con Auto-Refresh Avanzado</h2>
				<div className="flex gap-2">
					<Button onClick={handleRefreshAll} disabled={isAnyLoading}>
						{isAnyLoading ? "Actualizando..." : "Actualizar Todo"}
					</Button>
					<Button onClick={handleInvalidateQueries} variant="outline">
						Invalidar Queries
					</Button>
					<Button onClick={handleClearQueries} variant="destructive" size="sm">
						Limpiar Cache
					</Button>
				</div>
			</div>

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Facturado Hoy</CardTitle>
						<CardDescription>
							${workbenchData.kpis.facturadoHoy.amount.toLocaleString()} / $
							{workbenchData.kpis.facturadoHoy.objective.toLocaleString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{workbenchData.kpis.facturadoHoy.percentage.toFixed(1)}%</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefreshRevenue}
							disabled={refreshRevenueLast7Days.isPending}
							className="mt-2"
						>
							<RefreshCw className={`w-3 h-3 mr-1 ${refreshRevenueLast7Days.isPending ? "animate-spin" : ""}`} />
							{refreshRevenueLast7Days.isPending ? "Actualizando..." : "Actualizar"}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Últimos 7 Días</CardTitle>
						<CardDescription>
							${workbenchData.kpis.ultimos7Dias.amount.toLocaleString()} / $
							{workbenchData.kpis.ultimos7Dias.objective.toLocaleString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{workbenchData.kpis.ultimos7Dias.percentage.toFixed(1)}%</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Últimos 30 Días</CardTitle>
						<CardDescription>
							${workbenchData.kpis.ultimos30Dias.amount.toLocaleString()} / $
							{workbenchData.kpis.ultimos30Dias.objective.toLocaleString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{workbenchData.kpis.ultimos30Dias.percentage.toFixed(1)}%</div>
					</CardContent>
				</Card>
			</div>

			{/* Órdenes por Hora */}
			<Card>
				<CardHeader>
					<CardTitle>Órdenes por Hora</CardTitle>
					<CardDescription>{workbenchData.ordersByHour.length} registros encontrados</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{workbenchData.ordersByHour.map((order, index) => (
							<div key={index} className="flex justify-between items-center p-2 border rounded">
								<span>{order.hour}</span>
								<span>{order.count} órdenes</span>
								<span>${order.totalRevenue.toLocaleString()}</span>
							</div>
						))}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefreshOrdersByHour}
						disabled={refreshOrdersByHour.isPending}
						className="mt-4"
					>
						<RefreshCw className={`w-3 h-3 mr-1 ${refreshOrdersByHour.isPending ? "animate-spin" : ""}`} />
						{refreshOrdersByHour.isPending ? "Actualizando..." : "Actualizar Órdenes"}
					</Button>
				</CardContent>
			</Card>

			<div className="text-xs text-muted-foreground bg-muted p-4 rounded">
				<strong>Auto-Refresh:</strong> Los datos se actualizan automáticamente cuando cambias de usuario o negocio. Este
				componente usa el hook <code>useWorkbenchAutoRefreshAdvanced</code> que invalida todas las queries del workbench
				cuando detecta cambios en el usuario o businessId.
			</div>
		</div>
	);
};

export default WorkbenchWithAutoRefresh;
