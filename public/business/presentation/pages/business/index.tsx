import { useMediaQueryNetvoz } from "@/core/hooks/use-media-query-netvoz";
import useLocale from "@/core/locales/use-locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { BusinessForm } from "../../components/BusinessForm";
import { CurrencyForm } from "../../components/CurrencyForm";
import { LocationForm } from "../../components/LocationForm";
import { ObjectivesForm } from "../../components/ObjectivesForm";

export default function BusinessPage() {
	const { t } = useLocale();
	const isMobile = useMediaQueryNetvoz("(max-width: 768px)");
	const isTablet = useMediaQueryNetvoz("(max-width: 1024px)");

	return (
		<div className="container mx-auto py-6">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className={`font-bold ${isMobile ? "text-2xl" : "text-3xl"}`}>{t("business.title")}</h1>
					<p className={`text-muted-foreground mt-2 ${isMobile ? "text-sm" : ""}`}>{t("business.subtitle")}</p>
				</div>

				<Tabs defaultValue="business-info" className="w-full">
					<TabsList
						className={`w-full ${isMobile ? "grid grid-cols-2 gap-1 h-auto" : isTablet ? "grid grid-cols-2 gap-1 h-auto" : "grid grid-cols-4"}`}
					>
						<TabsTrigger
							value="business-info"
							className={`${isMobile ? "text-xs px-2 py-2" : isTablet ? "text-sm px-3 py-2" : ""}`}
						>
							{isMobile ? t("business.form.shortTitle") : t("business.form.title")}
						</TabsTrigger>
						<TabsTrigger
							value="objectives"
							className={`${isMobile ? "text-xs px-2 py-2" : isTablet ? "text-sm px-3 py-2" : ""}`}
						>
							{isMobile ? t("business.objectives.shortTitle") : t("business.objectives.title")}
						</TabsTrigger>
						<TabsTrigger
							value="currency"
							className={`${isMobile ? "text-xs px-2 py-2" : isTablet ? "text-sm px-3 py-2" : ""}`}
						>
							{isMobile ? t("business.currency.shortTitle") : t("business.currency.title")}
						</TabsTrigger>
						<TabsTrigger
							value="location"
							className={`${isMobile ? "text-xs px-2 py-2" : isTablet ? "text-sm px-3 py-2" : ""}`}
						>
							{isMobile ? t("business.location.shortTitle") : t("business.location.title")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="business-info" className="mt-6">
						<BusinessForm />
					</TabsContent>

					<TabsContent value="objectives" className="mt-6">
						<ObjectivesForm />
					</TabsContent>

					<TabsContent value="currency" className="mt-6">
						<CurrencyForm />
					</TabsContent>

					<TabsContent value="location" className="mt-6">
						<LocationForm />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
