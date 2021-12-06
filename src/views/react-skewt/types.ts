import type { Axis, NumberValue, ScaleLinear, ScaleLogarithmic, Line, Selection } from 'd3';
export type Data = { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];

export type LineTypes = {
	moistAdiabats: TPallette;
	temperature: TPallette;
	dryAdiabats: TPallette;
	isotherms: TPallette;
	dewpoint: TPallette;
	isohumes: TPallette;
	isobars: TPallette;
	grid: TPallette;
	elr: TPallette;
	background: string;
	foreground: string;
};

export type TPallette = {
	stroke: string;
	opacity: number | string;
	fill: string;
};

export type Options = {
	gradient: number;
	palette: LineTypes;
	onEvent: {
		click: (e: any) => void;
		hover: (e: any) => void;
	};
};

export type Props = {
	data: Data;
	options: Options;
};

export type _T = { mid: number; range: number; skew: number[] };
export type _P = { base: number; increment: number; top: number; at11km: number; log: number[]; mbarTicks: number[]; altTicks: number[] };

export type Scales = {
	tan: number;
	x: ScaleLinear<number, number, never>;
	y: ScaleLogarithmic<number, number, never>; //
};

export type Axes = {
	x0: Axis<NumberValue>;
	y0: Axis<NumberValue>;
	y1: Axis<NumberValue>;
	y2: Axis<NumberValue>;
};
