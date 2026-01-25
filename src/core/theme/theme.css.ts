import { assignVars, createGlobalTheme, createThemeContract, globalStyle } from "@vanilla-extract/css";
import { HtmlDataAttribute, ThemeColorPresets, ThemeMode } from "@/core/types/enum";
import { addColorChannels } from "@/core/utils/theme";
import { baseThemeTokens } from "./tokens/base";
import { darkColorTokens, lightColorTokens, presetsColors } from "./tokens/color";
import { darkShadowTokens, lightShadowTokens } from "./tokens/shadow";
import { typographyTokens } from "./tokens/typography";
import { themeTokens } from "./type";

const getThemeTokens = (theme: ThemeMode) => {
	const themeTokens = theme === ThemeMode.Light ? lightColorTokens : darkColorTokens;
	return {
		colors: addColorChannels(themeTokens),
		typography: typographyTokens,
		shadows: theme === ThemeMode.Light ? lightShadowTokens : darkShadowTokens,
		...baseThemeTokens,
	};
};

export const themeVars = createThemeContract({
	...themeTokens,
	colors: addColorChannels(themeTokens.colors),
});

for (const themeMode of Object.values(ThemeMode)) {
	createGlobalTheme(`:root[${HtmlDataAttribute.ThemeMode}=${themeMode}]`, themeVars, getThemeTokens(themeMode));
}

for (const preset of Object.values(ThemeColorPresets)) {
	globalStyle(`:root[${HtmlDataAttribute.ColorPalette}=${preset}]`, {
		vars: assignVars(themeVars.colors.palette.primary, {
			...addColorChannels(presetsColors[preset]),
		}),
	});
}
