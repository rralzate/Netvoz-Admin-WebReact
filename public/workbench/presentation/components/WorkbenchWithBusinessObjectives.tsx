import type React from "react";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";
import { useBusiness } from "@/features/business/presentation/hooks/useBusiness";
import { useWorkbenchAutoRefreshAdvanced, useWorkbenchWithBusiness } from "../hooks";

/**
 * Componente que demuestra el uso del workbench con objetivos reales del negocio
 */
export const WorkbenchWithBusinessObjectives: React.FC = () => {
	const { negocioId } = useUserInfo();
	const { business } = useBusiness();
	const { data: workbenchData, isLoading, error, refetch } = useWorkbenchWithBusiness(negocioId || "");
	const { invalidateAllWorkbenchQueries } = useWorkbenchAutoRefreshAdvanced();

	const handleRefresh = () => {
		refetch();
	};

	const handleInvalidateQueries = () => {
		invalidateAllWorkbenchQueries();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Cargando datos del dashboard con objetivos del negocio...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center space-y-4">
					<p className="text-destructive">Error al cargar los datos del dashboard</p>
					<Button onClick={handleRefresh}>Reintentar</Button>
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

	const objetivos = business?.configuracion?.objetivos;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold">Dashboard con Objetivos del Negocio</h2>
					<p className="text-muted-foreground">
						Objetivos configurados desde BusinessEntity: {business?.nombre || "Negocio no encontrado"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={handleRefresh} variant="outline">
						Actualizar Dashboard
					</Button>
					<Button onClick={handleInvalidateQueries} variant="outline">
						Invalidar Cache
					</Button>
				</div>
			</div>

			{/* Información de Objetivos */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Objetivos del Negocio
						{objetivos ? (
							<Badge variant="default">Configurados</Badge>
						) : (
							<Badge variant="secondary">Valores por defecto</Badge>
						)}
					</CardTitle>
					<CardDescription>
						Estos objetivos se obtienen desde la configuración del negocio y se usan para calcular los porcentajes de
						cumplimiento.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{objetivos ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-3 border rounded">
								<div className="text-sm text-muted-foreground">Facturado Hoy</div>
								<div className="text-lg font-semibold">${objetivos.facturadoHoy.toLocaleString()}</div>
							</div>
							<div className="text-center p-3 border rounded">
								<div className="text-sm text-muted-foreground">Últimos 7 Días</div>
								<div className="text-lg font-semibold">${objetivos.ultimos7Dias.toLocaleString()}</div>
							</div>
							<div className="text-center p-3 border rounded">
								<div className="text-sm text-muted-foreground">Últimos 30 Días</div>
								<div className="text-lg font-semibold">${objetivos.ultimos30Dias.toLocaleString()}</div>
							</div>
							<div className="text-center p-3 border rounded">
								<div className="text-sm text-muted-foreground">Año Actual</div>
								<div className="text-lg font-semibold">${objetivos.anioActual.toLocaleString()}</div>
							</div>
						</div>
					) : (
						<div className="text-center text-muted-foreground p-4">
							<p>No se encontraron objetivos configurados para este negocio.</p>
							<p className="text-sm">Se están usando valores por defecto.</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* KPIs con Objetivos Reales */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Facturado Hoy</CardTitle>
						<CardDescription>Objetivo: ${workbenchData.kpis.facturadoHoy.objective.toLocaleString()}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span>Monto actual:</span>
								<span className="font-semibold">${workbenchData.kpis.facturadoHoy.amount.toLocaleString()}</span>
							</div>
							<div className="flex justify-between items-center">
								<span>Progreso:</span>
								<span className="font-semibold">{workbenchData.kpis.facturadoHoy.percentage.toFixed(1)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${Math.min(workbenchData.kpis.facturadoHoy.percentage, 100)}%` }}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Últimos 7 Días</CardTitle>
						<CardDescription>Objetivo: ${workbenchData.kpis.ultimos7Dias.objective.toLocaleString()}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span>Monto actual:</span>
								<span className="font-semibold">${workbenchData.kpis.ultimos7Dias.amount.toLocaleString()}</span>
							</div>
							<div className="flex justify-between items-center">
								<span>Progreso:</span>
								<span className="font-semibold">{workbenchData.kpis.ultimos7Dias.percentage.toFixed(1)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${Math.min(workbenchData.kpis.ultimos7Dias.percentage, 100)}%` }}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Últimos 30 Días</CardTitle>
						<CardDescription>Objetivo: ${workbenchData.kpis.ultimos30Dias.objective.toLocaleString()}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span>Monto actual:</span>
								<span className="font-semibold">${workbenchData.kpis.ultimos30Dias.amount.toLocaleString()}</span>
							</div>
							<div className="flex justify-between items-center">
								<span>Progreso:</span>
								<span className="font-semibold">{workbenchData.kpis.ultimos30Dias.percentage.toFixed(1)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${Math.min(workbenchData.kpis.ultimos30Dias.percentage, 100)}%` }}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Resumen de Datos */}
			<Card>
				<CardHeader>
					<CardTitle>Resumen de Datos</CardTitle>
					<CardDescription>Información adicional del dashboard</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-3 border rounded">
							<div className="text-sm text-muted-foreground">Órdenes por Hora</div>
							<div className="text-lg font-semibold">{workbenchData.ordersByHour.length}</div>
						</div>
						<div className="text-center p-3 border rounded">
							<div className="text-sm text-muted-foreground">Días de Ingresos</div>
							<div className="text-lg font-semibold">{workbenchData.revenueLast7Days.length}</div>
						</div>
						<div className="text-center p-3 border rounded">
							<div className="text-sm text-muted-foreground">Top Productos</div>
							<div className="text-lg font-semibold">{workbenchData.top5Products.length}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="text-xs text-muted-foreground bg-muted p-4 rounded">
				<strong>Integración de Objetivos:</strong> Este componente demuestra cómo los objetivos del negocio
				(configurados en BusinessEntity) se integran automáticamente con el dashboard del workbench. Los KPIs muestran
				el progreso real basado en los objetivos configurados por el usuario.
			</div>
		</div>
	);
};

export default WorkbenchWithBusinessObjectives;
