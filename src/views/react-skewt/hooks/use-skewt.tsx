import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

import { useC2 } from '../controller/c2';
import { DEG2RAD } from './math';
const tan = Math.tan(45 * DEG2RAD);
type CTX_T = { mid: number; range: number; skew: number[] };
type CTX_P = { base: number; increment: number; top: number; at11km: number; log: number[]; mbarTicks: number[]; altTicks: number[] };
type CTX_Scales = {
	tan: number;
	x: d3.ScaleLinear<number, number, never>;
	y: d3.ScaleLogarithmic<number, number, never>; //
};
type CTX_Axes = {
	x0: d3.Axis<d3.NumberValue>;
	y0: d3.Axis<d3.NumberValue>;
	y1: d3.Axis<d3.NumberValue>;
	y2: d3.Axis<d3.NumberValue>;
};
export type SkewCTX = {
	options: SkewTOptions;
	data: { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
	P: CTX_P;
	T: CTX_T;
	lineGen: {
		// temp: d3.ValueFn<SVGPathElement,number,number>; //
		temp: d3.Line<[number, number]>;
		dewpt: d3.Line<[number, number]>;
		elr: d3.Line<[number, number]>;
		dalr: d3.Line<[number, number]>;
		malr: d3.Line<[number, number]>;
		isohume: d3.Line<[number, number]>;
	};
	diagramLines: any;
	parameters: { [key: string]: d3.Selection<SVGElement, {}, HTMLElement, any> };
	axes: CTX_Axes;
	scales: CTX_Scales;
	_all: number[][];
	eventHandler: (e: any) => void;
	datums: {
		press: number;
		hght: number;
		temp: number;
		dwpt: number;
		wdir: number;
		wspd: number;
	}[][];
	mainDims: {
		margin: { top: number; right: number; bottom: number; left: number };
		height: number;
		width: number;
		xOffset: number;
	};
	d3Refs: {
		Main: d3.Selection<any, unknown, null, undefined>;
		skewBackground: d3.Selection<any, unknown, null, undefined>;
		[key: string]: d3.Selection<any, unknown, null, undefined>;
	};
	drawDiagram: (d3Sel: any) => {
		diagramLines: {
			isobars: any;
			isotherms: any;
			envLapseRate: any;
			dryAdiabats: any;
			moistAdiabats: any;
		};
	};
	drawSounding: (d3Sel: any) => void;
	drawTicks: (d3Sel: any) => void;

	// resize: (d3Sel: any) => any;
	// setResize: TsetResize;
	resizeRequired: boolean;
	secondOrderRender: boolean;
	initialized: boolean;
	_loadState: { initialized: boolean; loaded: boolean; sized: boolean; background: boolean };
};
export type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

export const makeScales = (width: number, height: number, { mid, range }: CTX_T, { top, base }: CTX_P) => ({
	x: d3
		.scaleLinear()
		.range([-width / 2, width + width / 2])
		.domain([mid - range * 2, mid + range * 2]),
	//
	y: d3.scaleLog().range([0, height]).domain([top, base]),
	tan,
});

export const makeAxes = ({ x, y }: CTX_Scales, { log, mbarTicks, altTicks }) => {
	const x0 = d3.axisBottom(x).tickSize(0).ticks(40); //.orient("bottom");
	const y0 = d3
		.axisLeft(y)
		.tickSize(0)
		.tickValues(log.filter((p) => p % 100 === 0 || p === 50 || p === 150))
		.tickFormat(d3.format('.0d')); //.orient("left");
	const y1 = d3.axisRight(y).tickSize(5).tickValues(mbarTicks); //.orient("right");
	// d3.axisLeft(y).tickSize(2,0).tickValues(altticks);
	const y2 = d3.axisLeft(y).tickSize(2).tickValues(altTicks);

	return { x0, y0, y1, y2 };
};

type USEC2 = {
	state: SkewCTX;
	setState: setSkewCTX;
};
// state, onResize, setState, setOnResize, setD3Refs
export function useD3(refKey: string | null, render?: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps?: React.DependencyList) {
	// statful CTX
	const { state, setState }: USEC2 = useC2();
	// const {} = useInitial();
	// console.log(state);
	const ref: React.MutableRefObject<any> = useRef();
	// memo'd state for effects
	const {
		mainDims: { width, height },
		initialized,
	} = useMemo(() => state, [state]);

	// ! ...callbacks

	const renderWithD3 = useCallback(
		(d3Sel) => {
			if (!!render) {
				switch (refKey) {
					case 'Main':
					case 'Clipper':
						break;
					default:
						d3Sel.selectAll('*').remove();
						break;
				}

				render(d3Sel);
			}
		},
		[refKey, render]
	);
	// there are 2 useEffect render calls
	// the first is responsible for rendering the
	// non
	useEffect(() => {
		switch (refKey) {
			// Main is called to render regardless of height and width
			// as Main sets height and width
			case 'Main':
				renderWithD3(d3.select(ref.current));
				break;
			case 'Sounding':
				renderWithD3(d3.select(ref.current));
				break;
			default:
				if (!!width && !!height) renderWithD3(d3.select(ref.current));
				break;
		}
		return () => {};
		/**@IGNORE react-hooks/exhaustive-deps...//* only execute render when data changes*/
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref, refKey, width, height, ...(!!deps ? deps : [])]);

	// useEffect(() => {
	// 	switch (refKey) {
	// 		case 'Sounding':
	// 			if (!!width && !!height)renderWithD3(d3.select(ref.current));
	// 			break;
	// 		default:
	// 			// if (!!width && !!height) renderWithD3(d3.select(ref.current));
	// 			break;
	// 	}
	// 	return () => {};
	// 	/**@IGNORE react-hooks/exhaustive-deps...//* only execute render when data changes*/
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [ref, refKey, width, height, ...(!!deps ? deps : [])]);

	/**@CustomHook -> d3.render Callbacks */
	// const draw = useDraw();
	const eventHandler = useCallback((e) => {
		// console.log(e);
	}, []);
	const isInitialized = useCallback(() => initialized, [initialized]);
	return { ref, state, setState, eventHandler, isInitialized };
}
