import { Card, CardContent } from "@/core/ui/card";

interface KPICardProps {
	title: string;
	amount: number;
	objective: number;
	percentage: number;
	period: string;
}

export function KPICard({ amount, objective, percentage, period }: KPICardProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	return (
		<Card className="w-full">
			<CardContent className="p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
							<span className="text-xs sm:text-sm text-muted-foreground truncate">{period}</span>
						</div>
						<div className="text-xl sm:text-2xl font-bold text-primary mb-1 break-words">{formatCurrency(amount)}</div>
						<div className="text-xs sm:text-sm text-muted-foreground">
							<span className="hidden sm:inline">Objetivo </span>
							<span className="sm:hidden">Obj. </span>
							{formatCurrency(objective)}
						</div>
					</div>
					<div className="flex flex-col items-center flex-shrink-0">
						<div className="w-14 h-14 sm:w-16 sm:h-16 relative">
							<svg
								className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90"
								viewBox="0 0 36 36"
								role="img"
								aria-label="Circular progress indicator"
							>
								<title>Circular progress indicator</title>
								<path
									className="text-gray-200"
									stroke="currentColor"
									strokeWidth="3"
									fill="none"
									d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
								<path
									className="text-primary"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									fill="none"
									strokeDasharray={`${percentage}, 100`}
									d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="text-[10px] sm:text-xs font-semibold text-primary">{percentage.toFixed(1)}%</span>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
