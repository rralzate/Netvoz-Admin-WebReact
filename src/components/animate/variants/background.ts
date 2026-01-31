import type { BackgroundType } from "../types";

export const varBgColor = (props?: BackgroundType) => {
	const colors = props?.colors || ["#19dcea", "#b22cff"];
	const duration = props?.duration || 5;
	const ease = props?.ease || ("linear" as const);

	return {
		animate: {
			background: colors,
			transition: { duration, ease } as any,
		},
	};
};

// ----------------------------------------------------------------------

export const varBgKenburns = (props?: BackgroundType) => {
	const duration = props?.duration || 5;
	const ease = props?.ease || ("easeOut" as const);

	return {
		top: {
			animate: {
				scale: [1, 1.25],
				y: [0, -15],
				transformOrigin: ["50% 16%", "50% top"],
				transition: { duration, ease } as any,
			},
		},
		bottom: {
			animate: {
				scale: [1, 1.25],
				y: [0, 15],
				transformOrigin: ["50% 84%", "50% bottom"],
				transition: { duration, ease } as any,
			},
		},
		left: {
			animate: {
				scale: [1, 1.25],
				x: [0, 20],
				y: [0, 15],
				transformOrigin: ["16% 50%", "0% left"],
				transition: { duration, ease } as any,
			},
		},
		right: {
			animate: {
				scale: [1, 1.25],
				x: [0, -20],
				y: [0, -15],
				transformOrigin: ["84% 50%", "0% right"],
				transition: { duration, ease } as any,
			},
		},
	};
};

// ----------------------------------------------------------------------

export const varBgPan = (props?: BackgroundType) => {
	const colors = props?.colors || ["#ee7752", "#e73c7e", "#23a6d5", "#23d5ab"];
	const duration = props?.duration || 5;
	const ease = props?.ease || ("linear" as const);

	const gradient = (deg: number) => `linear-gradient(${deg}deg, ${colors})`;

	return {
		top: {
			animate: {
				backgroundImage: [gradient(0), gradient(0)],
				backgroundPosition: ["center 99%", "center 1%"],
				backgroundSize: ["100% 600%", "100% 600%"],
				transition: { duration, ease } as any,
			},
		},
		right: {
			animate: {
				backgroundPosition: ["1% center", "99% center"],
				backgroundImage: [gradient(270), gradient(270)],
				backgroundSize: ["600% 100%", "600% 100%"],
				transition: { duration, ease } as any,
			},
		},
		bottom: {
			animate: {
				backgroundImage: [gradient(0), gradient(0)],
				backgroundPosition: ["center 1%", "center 99%"],
				backgroundSize: ["100% 600%", "100% 600%"],
				transition: { duration, ease } as any,
			},
		},
		left: {
			animate: {
				backgroundPosition: ["99% center", "1% center"],
				backgroundImage: [gradient(270), gradient(270)],
				backgroundSize: ["600% 100%", "600% 100%"],
				transition: { duration, ease } as any,
			},
		},
	};
};
