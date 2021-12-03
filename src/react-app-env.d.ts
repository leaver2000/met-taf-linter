/// <reference types="react-scripts" />
declare type D3Selection = d3.Selection<any, unknown, null, undefined>;
declare type D3RenderCallback = (element: TSelection) => void;

declare type SkewTData = { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];

declare type LineTypes = {
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

declare type TPallette = {
	stroke: string;
	opacity: number | string;
	fill: string;
};

declare type SkewTOptions = {
	gradient: number;
	palette: LineTypes;
	onEvent: {
		click: (e: any) => void;
		hover: (e: any) => void;
	};
};

declare type SkewTProps = {
	data: SkewTData;
	options: SkewTOptions;
};
