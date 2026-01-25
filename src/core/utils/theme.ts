import color from "color";
import { type AddChannelToLeaf, themeTokens } from "../theme/type";

export function rgbAlpha(colorVal: string | string[] | number[], alpha: number): string {
	const safeAlpha = Math.max(0, Math.min(1, alpha));

	if (typeof colorVal === "string") {
		if (colorVal.startsWith("#")) {
			return color(colorVal).alpha(safeAlpha).toString();
		}
		if (colorVal.includes("var(")) {
			return `rgba(${colorVal} / ${safeAlpha})`;
		}
		if (colorVal.startsWith("--")) {
			return `rgba(var(${colorVal}) / ${safeAlpha})`;
		}

		if (colorVal.includes(",") || colorVal.includes(" ")) {
			const rgb = colorVal
				.split(/[,\s]+/)
				.map((n) => n.trim())
				.filter(Boolean);
			return `rgba(${rgb.join(", ")}, ${safeAlpha})`;
		}
	}

	if (Array.isArray(colorVal)) {
		return `rgba(${colorVal.join(", ")}, ${safeAlpha})`;
	}

	throw new Error("Invalid color format");
}

export const toCssVar = (propertyPath: string) => {
	return `--${propertyPath.split(".").join("-")}`;
};

export const createTailwinConfg = (propertyPath: string) => {
	const variants = getThemeTokenVariants(propertyPath);
	const result = variants.reduce(
		(acc, variant) => {
			acc[variant] = `var(${toCssVar(`${propertyPath}-${variant}`)})`;
			return acc;
		},
		{} as Record<string, string>,
	);
	return result;
};

export const creatColorChannel = (propertyPath: string) => {
	const variants = getThemeTokenVariants(propertyPath);
	const result = variants.reduce(
		(acc, variant) => {
			const variantKey = variant === "default" ? "DEFAULT" : variant;
			acc[variantKey] = `rgb(var(${toCssVar(`${propertyPath}-${variant}Channel`)}))`;
			return acc;
		},
		{} as Record<string, string>,
	);
	return result;
};

export const getThemeTokenVariants = (propertyPath: string) => {
	const keys = propertyPath.split(".");
	const val = keys.reduce((obj: any, key) => {
		if (obj && typeof obj === "object") {
			return obj[key];
		}
		return;
	}, themeTokens);

	return val ? Object.keys(val) : [];
};

export const removePx = (value: string | number): number => {
	if (typeof value === "number") return value;

	if (!value) {
		throw new Error("Invalid value: empty string");
	}

	const trimmed = value.trim();
	const hasPx = /px$/i.test(trimmed);
	const num = hasPx ? trimmed.slice(0, -2) : trimmed;
	const result = Number.parseFloat(num);

	if (Number.isNaN(result)) {
		throw new Error(`Invalid value: ${value}`);
	}

	return result;
};

export const addColorChannels = <T extends Record<string, any>>(obj: T): AddChannelToLeaf<T> => {
	const result: Record<string, any> = {};

	const isLeafObject = Object.values(obj).every((v) => v === null || typeof v === "string");

	if (isLeafObject) {
		for (const [key, value] of Object.entries(obj)) {
			result[key] = value;
			result[`${key}Channel`] = color(value).rgb().array().join(" ");
		}
	} else {
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "object" && value !== null) {
				result[key] = addColorChannels(value);
			} else {
				result[key] = value;
			}
		}
	}

	return result as AddChannelToLeaf<T>;
};
