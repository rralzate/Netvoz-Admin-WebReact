import type React from "react";
import { useNavigate } from "react-router";
import useLocale from "@/core/locales/use-locale";
import { Button } from "@/core/ui/button";

export const UnauthorizedPage: React.FC = () => {
	const { t } = useLocale();
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="text-center max-w-md mx-auto p-8">
				<div className="mb-8">
					<div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
						<svg
							className="w-12 h-12 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							role="img"
							aria-label="Warning icon"
						>
							<title>Warning</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-4">{t("sys.common.accessDenied")}</h1>
					<p className="text-gray-600 mb-8">{t("sys.common.permissionRequired")}</p>
				</div>

				<div className="space-y-4">
					<Button onClick={() => navigate("/dashboard")} className="w-full">
						{t("sys.common.backToDashboard")}
					</Button>

					<Button variant="outline" onClick={() => navigate(-1)} className="w-full">
						{t("sys.common.previousPage")}
					</Button>
				</div>
			</div>
		</div>
	);
};
