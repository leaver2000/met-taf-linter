import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import LineGenerators from './line-generators';
import { useDraw } from './use-draw';
import { useC2 } from '../controller/c2';

export type SkewCTX = {
	options: SkewTOptions;
	data: { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
	P: { base: number; increment: number; top: number; at11km: number; log: number[]; ticks: number[] };
	T: { mid: number; range: number; skew: number[] };
	lineGen: {
		temp: d3.Line<[number, number]>; //
		dewpt: d3.Line<[number, number]>;
		elr: d3.Line<[number, number]>;
		dalr: d3.Line<[number, number]>;
		malr: d3.Line<[number, number]>;
		isohume: d3.Line<[number, number]>;
	};
	parameters: { [key: string]: d3.Selection<SVGElement, {}, HTMLElement, any> };
	scales: {
		tan: number;
		x: d3.ScaleLinear<number, number, never>;
		y: d3.ScaleLogarithmic<number, number, never>; //
	};
	_all: number[][];
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
	_loadState: { initialized: boolean; loaded: boolean; sized: boolean; background: boolean };
};
export type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

export function useD3(refKey: string, render: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps: React.DependencyList) {
	// statful CTX
	const { state, setState }: { state: SkewCTX; setState: setSkewCTX } = useC2();
	// const {} = useInitial();

	const ref: React.MutableRefObject<any> = useRef();
	// memo'd state for effects
	const {
		P,
		T,
		mainDims: { margin },
		d3Refs: { Main },
	} = useMemo(() => state, [state]);

	// ! ...callbacks
	const initializeVariables = useCallback(
		(divMain) => {
			let width = parseInt(divMain.style('width'), 10) - 10;
			let height = width; //to fix
			width = width - margin.left - margin.right;
			height = width - margin.top - margin.bottom;

			//? x scale
			const x = d3
				.scaleLinear()
				.range([-width / 2, width + width / 2])
				.domain([T.mid - T.range * 2, T.mid + T.range * 2]); //range is width*2

			//? y scale
			const y = d3.scaleLog().range([0, height]).domain([P.top, P.base]);

			setState(({ _loadState, scales, mainDims, ...oldState }) => {
				scales = { ...scales, x, y };
				const lg = new LineGenerators(scales, P);

				const lineGen = {
					temp: lg.temp(),
					dewpt: lg.dewpt(),
					elr: lg.elr(),
					dalr: lg.dalr(),
					malr: lg.malr(),
					isohume: lg.isohume(),
				};

				return {
					...oldState,
					lineGen,
					scales,
					mainDims: { ...mainDims, width, height },
					_loadState: { ..._loadState, initialized: true },
				};
			});
			return true;
		},
		[T, P, margin, setState]
	);

	const resize = useCallback(
		(e) => {
			initializeVariables(Main);
		},
		[initializeVariables, Main]
	);

	const handleD3Render = useCallback(() => {
		const d3Ref = d3.select(ref.current);
		const newState = render(d3Ref);
		setState(({ d3Refs, ...oldState }: SkewCTX) =>
			// ? with the spread operator the refKey is added to the d3Refs
			!!newState
				? { ...{ ...newState, ...oldState }, d3Refs: { [refKey]: d3Ref, ...d3Refs } } //
				: { ...oldState, d3Refs: { [refKey]: d3Ref, ...d3Refs } }
		);
	}, [ref, refKey, render, setState]);

	//! effects
	useEffect(() => (!!Main ? window.addEventListener('resize', resize) : void 0), [resize, Main]);

	/**@IGNORE react-hooks/exhaustive-deps...//* only execute render when data changes*/
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => (!!render ? handleD3Render() : void 0), [...deps]);

	/**@CustomHook -> d3.render Callbacks */
	const draw = useDraw();

	return { ref, state, setState, draw, initializeVariables, resize };
}
