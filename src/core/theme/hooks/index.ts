import { useSettings } from "@/core/store/settingStore";

// Theme variables structure
const themeVars = {
	colors: {
		palette: {
			primary: {
				default: "var(--color-primary)",
				light: "var(--color-primary-light)",
				dark: "var(--color-primary-dark)",
				darker: "var(--color-primary-darker)",
			},
		},
	},
};

// Theme tokens structure (alias for themeVars)
const themeTokens = {
	color: {
		palette: {
			primary: {
				default: "var(--color-primary)",
				light: "var(--color-primary-light)",
				dark: "var(--color-primary-dark)",
			},
		},
	},
};

export function useTheme() {
	const settings = useSettings();
	return {
		themeMode: settings.themeMode,
		themeTokens,
		themeVars,
	};
}
