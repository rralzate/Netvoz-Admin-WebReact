import { useTranslation } from "react-i18next";
import { Chart } from "@/components/chart";
import { useChart } from "@/components/chart/useChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import type { OrderByHour } from "../../domain/entities/WorkbenchEntity";

interface OrdersByHourChartProps {
	data: OrderByHour[];
	isLoading?: boolean;
}

export function OrdersByHourChart({ data, isLoading }: OrdersByHourChartProps) {
	const { t } = useTranslation();
	const chartOptions = useChart({
		chart: {
			type: "line",
			height: 200,
		},
		xaxis: {
			categories: data.map((item) => item.hour),
			title: {
				text: "Hora",
			},
		},
		yaxis: {
			title: {
				text: "Cantidad de Pedidos",
			},
		},
		series: [
			{
				name: "Pedidos",
				data: data.map((item) => item.count),
			},
		],
		colors: ["#3b82f6"],
		stroke: {
			width: 3,
			curve: "smooth",
		},
		markers: {
			size: 6,
			colors: ["#3b82f6"],
		},
		grid: {
			show: true,
			strokeDashArray: 3,
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full"></div>
						{t("sys.workbench.numberOfOrdersByHour")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[200px] flex items-center justify-center">
						<div className="text-muted-foreground">Cargando...</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full"></div>
						{t("sys.workbench.numberOfOrdersByHour")}
					</CardTitle>
					<Select defaultValue="12">
						<SelectTrigger className="w-24">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="6">6 horas</SelectItem>
							<SelectItem value="12">12 horas</SelectItem>
							<SelectItem value="24">24 horas</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<Chart {...chartOptions} />
				) : (
					<div className="h-[200px] flex items-center justify-center">
						<div className="text-muted-foreground">No hay datos disponibles</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
