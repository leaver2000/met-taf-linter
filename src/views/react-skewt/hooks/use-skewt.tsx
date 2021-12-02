import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators';
import { useDraw } from './use-draw';
import { useController } from '../controller/c2';

type TPaletteOptions = {
	stroke: string;
	opacity: number | string;
	fill: string;
};

type Palette = {
	moistAdiabats: TPaletteOptions;
	temperature: TPaletteOptions;
	dryAdiabats: TPaletteOptions;
	isotherms: TPaletteOptions;
	dewpoint: TPaletteOptions;
	isohumes: TPaletteOptions;
	isobars: TPaletteOptions;
	grid: TPaletteOptions;
	elr: TPaletteOptions;
	background: string;
	foreground: string;
};

type SkewOptions = {
	fill: { background: string; foreground: string };
	onEvent: { click: () => void; focus: () => void; hover: () => void };
	palette: Palette;
	gradient: number;
};

// _styles:React.CSSProperties
export type SkewCTX = {
	options: SkewOptions;
	data: { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
	P: { base: number; increment: number; top: number; at11km: number; log: number[]; ticks: number[]; lines: number[] };
	T: { mid: number; range: number; skew: number[] };
	lineGen: { elr: d3.Line<[number, number]>; dalr: d3.Line<[number, number]>; malr: d3.Line<[number, number]>; isohume: d3.Line<[number, number]> };
	parameters: { [key: string]: d3.Selection<SVGElement, {}, HTMLElement, any> };
	_all: number[][];
	_styles: {
		margin: { top: number; right: number; bottom: number; left: number };
		height: number;
		width: number;
		xOffset: number;
	};

	// _selc: { [key: string]: d3.Selection<any, unknown, null, undefined> };
	_d3Refs: {
		skewBackground: d3.Selection<any, unknown, null, undefined>;
		[key: string]: d3.Selection<any, unknown, null, undefined>;
	};
	scales: {
		tan: number;
		x: d3.ScaleLinear<number, number, never>;
		y: d3.ScaleLogarithmic<number, number, never>; //
	};
	_loadState: { initialized: boolean; loaded: boolean; sized: boolean; background: boolean };
};
export type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

export function useD3(refKey: string, render: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps: React.DependencyList) {
	// statful CTX
	const { state, setState }: { state: SkewCTX; setState: setSkewCTX } = useController();

	const ref: React.MutableRefObject<any> = useRef();
	// memo'd state for effects
	const {
		P,
		T,
		_d3Refs: { skewContainer, skewSVG },
		_styles: { margin, width, height },
		_loadState: { loaded },
	} = useMemo(() => state, [state]);

	// ! ...callbacks
	const initializeVariables = useCallback(
		(divMain) => {
			let width = parseInt(divMain.style('width'), 10) - 10;
			let height = width; //to fix
			width = width - margin.left - margin.right;
			height = width - margin.top - margin.bottom;
			const x = d3
				.scaleLinear()
				.range([-width / 2, width + width / 2])
				.domain([T.mid - T.range * 2, T.mid + T.range * 2]); //range is width*2
			const y = d3.scaleLog().range([0, height]).domain([P.top, P.base]);

			setState(({ _loadState, scales, _styles, ...oldState }) => {
				scales = { ...scales, x, y };

				// // const elr =
				// const dalr = dalrLineGenerator(scales, P);
				// const malr = malrLineGenerator(scales, P, false);
				// // const isohume = isohumeLineGenerator(scales, P);
				const lineGen = {
					elr: elrLineGenerator(scales, P),
					dalr: dalrLineGenerator(scales, P),
					malr: malrLineGenerator(scales, P, false),
					isohume: isohumeLineGenerator(scales, P),
				};

				return {
					...oldState,
					lineGen,
					scales,
					_styles: { ..._styles, width, height },
					_loadState: { ..._loadState, initialized: true },
				};
			});
			return true;
		},
		[T, P, margin, setState]
	);
	// const shiftXAxis = useCallback(() => {
	// 	// let xOffset = this.xOffset;
	// 	// this._d3Refs.clipper.attr('x', -xOffset);
	// 	// console.log(this._d3Refs.xAxisValues);
	// 	// this._d3Refs.xAxisValues.attr('transform', `translate(${xOffset}, ${this._styles.height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
	// 	// // console.log(this._d3Refs.xAxisValues, root);
	// 	// // let xAxe = d3.select(_this._xAxisValues)._group;
	// 	// // console.log(xAxe).attr('transform', `translate(${xOffset}, ${height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
	// 	// for (let p in this._lines) {
	// 	// 	this._lines[p].attr('transform', `translate(${xOffset},0)`);
	// 	// }
	// }, []);
	// shiftXAxisshiftXAxis
	// const draw = useCallback((type: string) => withDraw(type, state), [state]);
	const resize = useCallback(() => {
		// skewBackground.selectAll('*').remove();
		// setVariables(divMain);
		skewSVG.attr('width', width + margin.right + margin.left).attr('height', height + margin.top + margin.bottom);
		skewContainer.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		return true;
		// drawBackground();
		// dataAr.forEach(d=> {
		//     plot(d.data,{add:true, select:false});
		// } );//redraw each plot
		// if(selectedSkewt) selectSkewt(selectedSkewt.data);
		// shiftXAxis();
		// tooltipRect.attr("width", w).attr("height", h);
		// cloudContainer.style("left", (margin.left+2) +"px").style("top", margin.top+"px").style("height", h+"px");
		// let canTop=y(100);  //top of canvas for pressure 100
		// cloudCanvas1.style("left","0px").style( "top",canTop+"px").style("height",(h-canTop)+"px");
		// cloudCanvas2.style("left","10px").style("top",canTop+"px").style("height",(h-canTop)+"px");
		// }
	}, [skewContainer, skewSVG, width, height, margin]);

	//? primary D3 callback render, called when new data is loaded
	//! NEEDS CALLBACK TO RESET STATE WHEN NEW CONTENT IS LOADED
	const handleD3Render = useCallback(() => {
		const d3Ref = d3.select(ref.current);
		//? render returns either a stateful object | [ null | void | undefined ]
		const newState = render(d3Ref);

		setState(({ _d3Refs, ...oldState }: SkewCTX) =>
			// ? with the spread operator the refKey is added to the _d3Refs
			!!newState
				? { ...{ ...newState, ...oldState }, _d3Refs: { [refKey]: d3Ref, ..._d3Refs } } //
				: { ...oldState, _d3Refs: { [refKey]: d3Ref, ..._d3Refs } }
		);
	}, [ref, refKey, render, setState]);

	//! effects
	useEffect(() => (loaded ? window.addEventListener('resize', resize) : void 0), [loaded, resize]);

	// ! ignore typescript... only execute render when data changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => (!!render ? handleD3Render() : void 0), [...deps]);

	/**@CustomHook -> d3.render Callbacks */
	const draw = useDraw();

	return { ref, state, setState, draw, initializeVariables, resize };
}
