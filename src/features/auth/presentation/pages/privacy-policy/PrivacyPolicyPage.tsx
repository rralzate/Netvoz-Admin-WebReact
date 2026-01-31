import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";

function PrivacyPolicyPage() {
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
						{t("sys.privacyPolicy.goBack")}
					</Button>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">{t("sys.privacyPolicy.title")}</h1>
					<p className="text-gray-600">{t("sys.privacyPolicy.subtitle")}</p>
				</div>

				{/* Content */}
				<Card>
					<CardHeader>
						<CardTitle className="text-xl font-semibold text-primary">{t("sys.privacyPolicy.introduction")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="prose prose-sm max-w-none">
							<p className="text-gray-700 leading-relaxed">{t("sys.privacyPolicy.introText1")}</p>
							<p className="text-gray-700 leading-relaxed">{t("sys.privacyPolicy.introText2")}</p>
							<p className="text-gray-700 leading-relaxed">{t("sys.privacyPolicy.introText3")}</p>
							<p className="text-gray-700 leading-relaxed">{t("sys.privacyPolicy.introText4")}</p>
						</div>

						{/* 1. ASPECTOS GENERALES DEL TRATAMIENTO DE DATOS */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-4">1. {t("sys.privacyPolicy.section1.title")}</h2>

							{/* 1.1 Identificación del Responsable */}
							<div className="mb-6">
								<h3 className="text-md font-medium text-gray-800 mb-3">
									1.1. {t("sys.privacyPolicy.section1.1.title")}
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg">
									<ul className="space-y-2 text-sm text-gray-700">
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.company")}:</strong> Innodrive S.A.S. - NETVOZ
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.nit")}:</strong> 900.850.691
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.address")}:</strong> Manizales, Caldas
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.street")}:</strong> CR 26 69 23
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.website")}:</strong> www.Netvoz.co
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.email")}:</strong> hola@Netvoz.co
										</li>
										<li>
											<strong>{t("sys.privacyPolicy.section1.1.phone")}:</strong> (+57) 3166540958
										</li>
									</ul>
								</div>
							</div>

							{/* 1.2 Naturaleza de la Información */}
							<div className="mb-6">
								<h3 className="text-md font-medium text-gray-800 mb-3">
									1.2. {t("sys.privacyPolicy.section1.2.title")}
								</h3>
								<p className="text-gray-700 mb-3">{t("sys.privacyPolicy.section1.2.intro")}</p>

								<div className="space-y-4">
									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											a) {t("sys.privacyPolicy.section1.2.a.title")}
										</h4>
										<p className="text-sm text-gray-700 mb-2">{t("sys.privacyPolicy.section1.2.a.description")}</p>
										<ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
											<li>{t("sys.privacyPolicy.section1.2.a.item1")}</li>
											<li>{t("sys.privacyPolicy.section1.2.a.item2")}</li>
											<li>{t("sys.privacyPolicy.section1.2.a.item3")}</li>
											<li>{t("sys.privacyPolicy.section1.2.a.item4")}</li>
											<li>{t("sys.privacyPolicy.section1.2.a.item5")}</li>
										</ul>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											b) {t("sys.privacyPolicy.section1.2.b.title")}
										</h4>
										<p className="text-sm text-gray-700">{t("sys.privacyPolicy.section1.2.b.description")}</p>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											c) {t("sys.privacyPolicy.section1.2.c.title")}
										</h4>
										<p className="text-sm text-gray-700">{t("sys.privacyPolicy.section1.2.c.description")}</p>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											d) {t("sys.privacyPolicy.section1.2.d.title")}
										</h4>
										<p className="text-sm text-gray-700 mb-2">{t("sys.privacyPolicy.section1.2.d.description")}</p>
									</div>
								</div>
							</div>

							{/* 1.3 Fuentes de la Información */}
							<div className="mb-6">
								<h3 className="text-md font-medium text-gray-800 mb-3">
									1.3. {t("sys.privacyPolicy.section1.3.title")}
								</h3>
								<div className="space-y-3">
									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.3.1. {t("sys.privacyPolicy.section1.3.1.title")}
										</h4>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.3.2. {t("sys.privacyPolicy.section1.3.2.title")}
										</h4>
										<p className="text-sm text-gray-700 mb-2">{t("sys.privacyPolicy.section1.3.2.description")}</p>
										<ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
											<li>{t("sys.privacyPolicy.section1.3.2.item1")}</li>
											<li>{t("sys.privacyPolicy.section1.3.2.item2")}</li>
											<li>{t("sys.privacyPolicy.section1.3.2.item3")}</li>
											<li>{t("sys.privacyPolicy.section1.3.2.item4")}</li>
											<li>{t("sys.privacyPolicy.section1.3.2.item5")}</li>
										</ul>
										<p className="text-sm text-gray-700 mt-2 italic">{t("sys.privacyPolicy.section1.3.2.note")}</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.3.3. {t("sys.privacyPolicy.section1.3.3.title")}
										</h4>
										<p className="text-sm text-gray-700">{t("sys.privacyPolicy.section1.3.3.description")}</p>
									</div>
								</div>
							</div>

							{/* 1.4 Tratamiento de los Datos Personales */}
							<div className="mb-6">
								<h3 className="text-md font-medium text-gray-800 mb-3">
									1.4. {t("sys.privacyPolicy.section1.4.title")}
								</h3>

								<div className="space-y-4">
									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.4.1. {t("sys.privacyPolicy.section1.4.1.title")}
										</h4>
										<p className="text-sm text-gray-700">{t("sys.privacyPolicy.section1.4.1.description")}</p>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.4.2. {t("sys.privacyPolicy.section1.4.2.title")}
										</h4>
										<p className="text-sm text-gray-700">{t("sys.privacyPolicy.section1.4.2.description")}</p>
									</div>

									<div>
										<h4 className="text-sm font-medium text-gray-800 mb-2">
											1.4.3. {t("sys.privacyPolicy.section1.4.3.title")}
										</h4>
										<p className="text-sm text-gray-700 mb-3">{t("sys.privacyPolicy.section1.4.3.description")}</p>
										<ol className="text-sm text-gray-700 list-decimal list-inside space-y-2 ml-4">
											<li>{t("sys.privacyPolicy.section1.4.3.item1")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item2")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item3")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item4")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item5")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item6")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item7")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item8")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item9")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item10")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item11")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item12")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item13")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item14")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item15")}</li>
											<li>{t("sys.privacyPolicy.section1.4.3.item16")}</li>
										</ol>
										<p className="text-sm text-gray-700 mt-3">{t("sys.privacyPolicy.section1.4.3.finalNote")}</p>
									</div>
								</div>
							</div>

							{/* Continue with remaining sections... */}
							<div className="text-center py-8">
								<p className="text-sm text-gray-500">{t("sys.privacyPolicy.fullDocument")}</p>
								<Button variant="outline" onClick={handleGoBack} className="mt-4">
									{t("sys.privacyPolicy.goBack")}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default PrivacyPolicyPage;
