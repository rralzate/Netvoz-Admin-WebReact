import type { CSSProperties } from "react";
import useLocale from "@/core/locales/use-locale";
import { Text, Title } from "@/core/ui/typography";
import { GLOBAL_CONFIG } from "@/global-config";

export default function BannerCard() {
	const { t } = useLocale();
	const bgStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
		opacity: 0.5,
	};
	return (
		<div className="relative bg-primary/90">
			<div className="p-6 z-2 relative">
				<div className="grid grid-cols-2 gap-4">
					<div className="col-span-2 md:col-span-1">
						<div className="flex flex-col gap-4">
							<Title as="h2" className="text-white">
								{GLOBAL_CONFIG.appName}
							</Title>
							<Text className="text-white">
								{t("sys.common.welcome")} {GLOBAL_CONFIG.appName}.
							</Text>
						</div>
					</div>

					<div className="col-span-2 md:col-span-1">
						<div className="w-full h-full flex items-center justify-end">
							<div className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center">
								<span className="text-6xl">🚀</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div style={bgStyle} className="z-1" />
		</div>
	);
}
