import { Icon } from "@/components/icon";
import useLocale from "@/core/locales/use-locale";
import { themeVars } from "@/core/theme/theme.css";
import { LocalEnum } from "@/core/types/enum";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { RadioGroup, RadioGroupItem } from "@/core/ui/radio-group";

export default function MultiLanguagePage() {
	const {
		setLocale,
		locale,
		language: { icon, label },
	} = useLocale();

	return (
		<>
			<Button variant="link" asChild>
				<a href="https://www.i18next.com/" style={{ color: themeVars.colors.palette.primary.default }}>
					https://www.i18next.com
				</a>
			</Button>
			<Button variant="link" asChild>
				<a href="https://ant.design/docs/react/i18n-cn" style={{ color: themeVars.colors.palette.primary.default }}>
					https://ant.design/docs/react/i18n-cn
				</a>
			</Button>
			<Card>
				<CardHeader>
					<CardTitle>Flexible</CardTitle>
				</CardHeader>
				<CardContent>
					<RadioGroup onValueChange={(value: LocalEnum) => setLocale(value)} defaultValue={locale}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value={LocalEnum.en_US} id="en_US" />
							<label htmlFor="en_US">English</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value={LocalEnum.en_US} id="en_US" />
							<label htmlFor="en_US">Español</label>
						</div>
					</RadioGroup>

					<div className="flex items-center text-4xl">
						<Icon icon={`local:${icon}`} className="mr-4 rounded-md" size="30" />
						{label}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
