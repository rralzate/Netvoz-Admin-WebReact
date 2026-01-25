import { useTranslation } from "react-i18next";

export function SubscriptionsPage() {
	const { t } = useTranslation();

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">{t("subscriptions.title")}</h1>
				<p className="mt-2 text-gray-600">{t("subscriptions.list")}</p>
			</div>

			<div className="rounded-lg border bg-card p-6 shadow-sm">
				<div className="text-center">
					<p className="text-lg text-muted-foreground">
						Módulo administrativo de suscripciones - En desarrollo
					</p>
				</div>
			</div>
		</div>
	);
}
