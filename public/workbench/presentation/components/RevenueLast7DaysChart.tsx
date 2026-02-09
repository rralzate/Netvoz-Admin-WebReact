import { useTranslation } from "react-i18next";
import { Chart } from "@/components/chart";
import { useChart } from "@/components/chart/useChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import type { RevenueByDay } from "../../domain/entities/WorkbenchEntity";

interface RevenueLast7DaysChartProps {
	data: RevenueByDay[];
	isLoading?: boolean;
}

export function RevenueLast7DaysChart({ data, isLoading }: RevenueLast7DaysChartProps) {
	const { t } = useTranslation();
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const chartOptions = useChart({
		chart: {
			type: "bar",
			height: 200,
		},
		xaxis: {
			categories: data.map((item) => {
				const date = new Date(item.date);
				return date.toLocaleDateString("es-ES", { weekday: "short" });
			}),
			title: {
				text: "Días de la Semana",
			},
		},
		yaxis: {
			title: {
				text: "Facturación",
			},
			labels: {
				formatter: (value: number) => formatCurrency(value),
			},
		},
		series: [
			{
				name: "Facturación",
				data: data.map((item) => item.revenue),
			},
		],
		colors: ["#ef4444"],
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "60%",
			},
		},
		dataLabels: {
			enabled: false,
		},
		grid: {
			show: true,
			strokeDashArray: 3,
		},
		tooltip: {
			y: {
				formatter: (value: number) => formatCurrency(value),
			},
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="w-2 h-2 bg-red-500 rounded-full"></div>
						{t("sys.workbench.last7DaysRevenue")}
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
				<CardTitle className="flex items-center gap-2">
					<div className="w-2 h-2 bg-red-500 rounded-full"></div>
					{t("sys.workbench.last7DaysRevenue")}
				</CardTitle>
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
