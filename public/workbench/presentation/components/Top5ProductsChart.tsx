import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import type { TopProduct } from "../../domain/entities/WorkbenchEntity";

interface Top5ProductsChartProps {
	data: TopProduct[];
	isLoading?: boolean;
}

export function Top5ProductsChart({ data, isLoading }: Top5ProductsChartProps) {
	const { t } = useTranslation();
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="w-2 h-2 bg-red-500 rounded-full"></div>
						{t("sys.workbench.top5Products")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[200px] flex items-center justify-center">
						<div className="text-muted-foreground">{t("common.loading")}</div>
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
					{t("sys.workbench.top5Products")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<div className="space-y-4">
						<div className="text-center text-lg font-semibold text-primary mb-4">TOP 5 PRODUCTOS</div>
						<div className="space-y-3">
							{data.map((product, index) => (
								<div key={product.productoId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
											{index + 1}
										</div>
										<div>
											<div className="font-medium text-sm">{product.productName}</div>
											<div className="text-xs text-muted-foreground">
												{product.totalSold} {t("sys.workbench.sold")} • {product.totalOrders} pedidos
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="font-semibold text-sm">{formatCurrency(product.revenue)}</div>
										<div className="text-xs text-muted-foreground">
											{product.averageQuantityPerOrder.toFixed(1)} por pedido
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="h-[200px] flex items-center justify-center">
						<div className="text-muted-foreground">{t("common.noDataAvailable")}</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
