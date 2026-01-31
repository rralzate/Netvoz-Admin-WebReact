export type VariantsType = {
	durationIn?: number;
	durationOut?: number;
	easeIn?: [number, number, number, number] | string;
	easeOut?: [number, number, number, number] | string;
	distance?: number;
};

export type TranHoverType = {
	duration?: number;
	ease?: [number, number, number, number] | string;
};
export type TranEnterType = {
	durationIn?: number;
	easeIn?: [number, number, number, number] | string;
};
export type TranExitType = {
	durationOut?: number;
	easeOut?: [number, number, number, number] | string;
};

export type BackgroundType = {
	duration?: number;
	ease?: [number, number, number, number] | string;
	colors?: string[];
};
