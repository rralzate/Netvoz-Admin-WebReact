import type { Locale as AntdLocal } from "antd/es/locale";
import en_US from "antd/locale/en_US";
import es_ES from "antd/locale/es_ES";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { LocalEnum } from "@/core/types/enum";

type Locale = keyof typeof LocalEnum;
type Language = {
	locale: keyof typeof LocalEnum;
	icon: string;
	label: string;
	antdLocal: AntdLocal;
};

export const LANGUAGE_MAP: Record<Locale, Language> = {
	[LocalEnum.en_US]: {
		locale: LocalEnum.en_US,
		label: "English",
		icon: "flag-us",
		antdLocal: en_US,
	},
	[LocalEnum.es_ES]: {
		locale: LocalEnum.es_ES,
		label: "Spanish",
		icon: "flag-es",
		antdLocal: es_ES,
	},
};

export default function useLocale() {
	const { t, i18n } = useTranslation();

	const locale = (i18n.resolvedLanguage || LocalEnum.es_ES) as Locale;
	const language = LANGUAGE_MAP[locale];

	const setLocale = (locale: Locale) => {
		i18n.changeLanguage(locale);
		document.documentElement.lang = locale;
		dayjs.locale(locale);
	};

	return {
		t,
		locale,
		language,
		setLocale,
	};
}
