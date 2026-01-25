import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { LocalEnum, StorageEnum } from "@/core/types/enum";
import { getStringItem } from "@/core/utils/storage";
import en_US from "./lang/en_US";
import es_ES from "./lang/es_ES";

const defaultLng = getStringItem(StorageEnum.I18N) || (LocalEnum.es_ES as string);

document.documentElement.lang = defaultLng;

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: false,
		lng: defaultLng,
		fallbackLng: LocalEnum.es_ES,
		interpolation: {
			escapeValue: false,
		},
		resources: {
			en_US: { translation: en_US },
			es_ES: { translation: es_ES },
		},
	});

export const { t } = i18n;
export default i18n;
