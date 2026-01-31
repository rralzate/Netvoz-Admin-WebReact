import { useEffect, useState } from "react";

// Breakpoint values (matching Tailwind defaults)
const breakpoints = {
	xs: 480,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Create a media query for screens smaller than the breakpoint
 */
export function down(breakpoint: Breakpoint): string {
	return `(max-width: ${breakpoints[breakpoint] - 1}px)`;
}

/**
 * Create a media query for screens larger than or equal to the breakpoint
 */
export function up(breakpoint: Breakpoint): string {
	return `(min-width: ${breakpoints[breakpoint]}px)`;
}

/**
 * Create a media query for screens between two breakpoints
 */
export function between(min: Breakpoint, max: Breakpoint): string {
	return `(min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`;
}

/**
 * Hook to track media query matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() => {
		if (typeof window !== "undefined") {
			return window.matchMedia(query).matches;
		}
		return false;
	});

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		// Use addEventListener for modern browsers
		mediaQuery.addEventListener("change", handler);

		return () => {
			mediaQuery.removeEventListener("change", handler);
		};
	}, [query]);

	return matches;
}

/**
 * Predefined media query hooks
 */
export function useIsMobile(): boolean {
	return useMediaQuery(down("md"));
}

export function useIsTablet(): boolean {
	return useMediaQuery(between("md", "lg"));
}

export function useIsDesktop(): boolean {
	return useMediaQuery(up("lg"));
}
