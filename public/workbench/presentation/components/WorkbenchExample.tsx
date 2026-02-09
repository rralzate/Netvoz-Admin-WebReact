import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";
import { useGetWorkbenchData, useWorkbenchMutations } from "../hooks/useWorkbenchUseCases";

/**
 * Componente de ejemplo que demuestra cómo usar los nuevos hooks del workbench
 */
export const WorkbenchExample = () => {
	const { negocioId } = useUserInfo();
	const { data: workbenchData, isLoading, error, refetch } = useGetWorkbenchData(negocioId || "");
	const { refreshOrdersByHour, refreshRevenueLast7Days, refreshTotalRevenue, refreshTop5Products, isAnyLoading } =
		useWorkbenchMutations();

	const handleRefreshAll = () => {
		refetch();
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

	const handleRefreshTotalRevenue = () => {
		const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
		refreshTotalRevenue.mutate({ startDate: startOfMonth, endDate: endOfMonth });
	};

	const handleRefreshTop5Products = () => {
		const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
		refreshTop5Products.mutate({ startDate: startOfMonth, endDate: endOfMonth });
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
				<div className="text-center">
					<p className="text-destructive mb-4">Error al cargar los datos del dashboard</p>
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
				<h2 className="text-2xl font-bold">Dashboard - Mesa de Trabajo</h2>
				<div className="flex gap-2">
					<Button onClick={handleRefreshAll} disabled={isAnyLoading}>
						{isAnyLoading ? "Actualizando..." : "Actualizar Todo"}
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
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefreshRevenue}
							disabled={refreshRevenueLast7Days.isPending}
							className="mt-2"
						>
							{refreshRevenueLast7Days.isPending ? "Actualizando..." : "Actualizar"}
						</Button>
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
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefreshTotalRevenue}
							disabled={refreshTotalRevenue.isPending}
							className="mt-2"
						>
							{refreshTotalRevenue.isPending ? "Actualizando..." : "Actualizar"}
						</Button>
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
						{refreshOrdersByHour.isPending ? "Actualizando..." : "Actualizar Órdenes"}
					</Button>
				</CardContent>
			</Card>

			{/* Top 5 Productos */}
			<Card>
				<CardHeader>
					<CardTitle>Top 5 Productos del Mes</CardTitle>
					<CardDescription>{workbenchData.top5Products.length} productos encontrados</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{workbenchData.top5Products.map((product, index) => (
							<div key={index} className="flex justify-between items-center p-2 border rounded">
								<span>{product.productName}</span>
								<span>{product.totalSold} vendidos</span>
								<span>${product.revenue.toLocaleString()}</span>
							</div>
						))}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefreshTop5Products}
						disabled={refreshTop5Products.isPending}
						className="mt-4"
					>
						{refreshTop5Products.isPending ? "Actualizando..." : "Actualizar Productos"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default WorkbenchExample;
