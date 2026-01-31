import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";

function TermsAndConditionsPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<div className="mb-6">
					<Button variant="ghost" onClick={handleGoBack} className="mb-4 text-primary hover:text-primary/80">
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t("sys.termsAndConditions.goBack")}
					</Button>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">{t("sys.termsAndConditions.title")}</h1>
					<p className="text-gray-600">{t("sys.termsAndConditions.subtitle")}</p>
				</div>

				{/* Content */}
				<Card>
					<CardContent className="space-y-6 py-8">
						<div className="prose prose-sm max-w-none">
							{/* Last Updated */}
							<div className="bg-blue-50 p-4 rounded-lg mb-6">
								<p className="text-sm text-blue-800 font-medium">
									{t("sys.termsAndConditions.lastUpdated")}: {t("sys.termsAndConditions.updateDate")}
								</p>
							</div>

							{/* Section 1 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									1. {t("sys.termsAndConditions.section1.title")}
								</h2>
								<p className="text-gray-700 leading-relaxed">{t("sys.termsAndConditions.section1.content")}</p>
							</div>

							{/* Section 2 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									2. {t("sys.termsAndConditions.section2.title")}
								</h2>
								<p className="text-gray-700 leading-relaxed mb-4">{t("sys.termsAndConditions.section2.content")}</p>
								<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
									<li>{t("sys.termsAndConditions.section2.item1")}</li>
									<li>{t("sys.termsAndConditions.section2.item2")}</li>
									<li>{t("sys.termsAndConditions.section2.item3")}</li>
									<li>{t("sys.termsAndConditions.section2.item4")}</li>
									<li>{t("sys.termsAndConditions.section2.item5")}</li>
									<li>{t("sys.termsAndConditions.section2.item6")}</li>
									<li>{t("sys.termsAndConditions.section2.item7")}</li>
									<li>{t("sys.termsAndConditions.section2.item8")}</li>
								</ul>
							</div>

							{/* Section 3 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									3. {t("sys.termsAndConditions.section3.title")}
								</h2>

								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											3.1 {t("sys.termsAndConditions.section3.subsection1.title")}
										</h3>
										<p className="text-gray-700 mb-3">{t("sys.termsAndConditions.section3.subsection1.content")}</p>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section3.subsection1.item1")}</li>
											<li>{t("sys.termsAndConditions.section3.subsection1.item2")}</li>
											<li>{t("sys.termsAndConditions.section3.subsection1.item3")}</li>
											<li>{t("sys.termsAndConditions.section3.subsection1.item4")}</li>
										</ul>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											3.2 {t("sys.termsAndConditions.section3.subsection2.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section3.subsection2.content")}</p>
									</div>
								</div>
							</div>

							{/* Section 4 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									4. {t("sys.termsAndConditions.section4.title")}
								</h2>

								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											4.1 {t("sys.termsAndConditions.section4.subsection1.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section4.subsection1.content")}</p>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											4.2 {t("sys.termsAndConditions.section4.subsection2.title")}
										</h3>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section4.subsection2.item1")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection2.item2")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection2.item3")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection2.item4")}</li>
										</ul>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											4.3 {t("sys.termsAndConditions.section4.subsection3.title")}
										</h3>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section4.subsection3.item1")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection3.item2")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection3.item3")}</li>
											<li>{t("sys.termsAndConditions.section4.subsection3.item4")}</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Section 5 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									5. {t("sys.termsAndConditions.section5.title")}
								</h2>

								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											5.1 {t("sys.termsAndConditions.section5.subsection1.title")}
										</h3>
										<p className="text-gray-700 mb-3">{t("sys.termsAndConditions.section5.subsection1.content")}</p>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section5.subsection1.item1")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection1.item2")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection1.item3")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection1.item4")}</li>
										</ul>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											5.2 {t("sys.termsAndConditions.section5.subsection2.title")}
										</h3>
										<p className="text-gray-700 mb-3">{t("sys.termsAndConditions.section5.subsection2.content")}</p>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section5.subsection2.item1")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection2.item2")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection2.item3")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection2.item4")}</li>
											<li>{t("sys.termsAndConditions.section5.subsection2.item5")}</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Section 6 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									6. {t("sys.termsAndConditions.section6.title")}
								</h2>

								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											6.1 {t("sys.termsAndConditions.section6.subsection1.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section6.subsection1.content")}</p>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											6.2 {t("sys.termsAndConditions.section6.subsection2.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section6.subsection2.content")}</p>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											6.3 {t("sys.termsAndConditions.section6.subsection3.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section6.subsection3.content")}</p>
									</div>
								</div>
							</div>

							{/* Section 7 */}
							<div className="mb-8">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									7. {t("sys.termsAndConditions.section7.title")}
								</h2>

								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											7.1 {t("sys.termsAndConditions.section7.subsection1.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section7.subsection1.content")}</p>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											7.2 {t("sys.termsAndConditions.section7.subsection2.title")}
										</h3>
										<p className="text-gray-700 mb-3">{t("sys.termsAndConditions.section7.subsection2.content")}</p>
										<ul className="text-gray-700 list-disc list-inside space-y-2 ml-4">
											<li>{t("sys.termsAndConditions.section7.subsection2.item1")}</li>
											<li>{t("sys.termsAndConditions.section7.subsection2.item2")}</li>
											<li>{t("sys.termsAndConditions.section7.subsection2.item3")}</li>
											<li>{t("sys.termsAndConditions.section7.subsection2.item4")}</li>
										</ul>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-800 mb-3">
											7.3 {t("sys.termsAndConditions.section7.subsection3.title")}
										</h3>
										<p className="text-gray-700">{t("sys.termsAndConditions.section7.subsection3.content")}</p>
									</div>
								</div>
							</div>

							{/* Continue with remaining sections... */}
							<div className="text-center py-8">
								<p className="text-sm text-gray-500">{t("sys.termsAndConditions.fullDocument")}</p>
								<Button variant="outline" onClick={handleGoBack} className="mt-4">
									{t("sys.termsAndConditions.goBack")}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default TermsAndConditionsPage;
