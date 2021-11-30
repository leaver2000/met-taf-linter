import { useEffect, useRef, useCallback, useState, useMemo, createContext, useContext } from 'react';
import * as d3 from 'd3';
// import useDraw from './use-draw';
import { DEG2RAD, getElevation, pressureFromElevation } from '../util/atmosphere';

const makeIntialState = ({ data, options: { gradient, ...options } }) => {
	console.log(options);
	var altticks: number[] = [];
	for (let i = 0; i < 20000; i += 10000 / 3.28084) altticks.push(pressureFromElevation(i));
	//*pressure
	const top = 50;
	const base = 1050;
	const increment = -50;
	const _isoBars = {
		pAt11km: pressureFromElevation(11000),
		lines: d3.range(base, top - 50, increment),
		ticks: d3.range(base, top - 50, -25),
		steph: getElevation(top) / 30,
		top,
		base,
		increment,
		highlight: false,
	};
	//*thermals
	const mid = 0;
	const range = 50;
	const dryAdiabticLapseRate = d3
		.scaleLinear()
		.domain([mid - range * 2, mid + range * 4])
		.ticks(36);

	const _isoTherms = {
		bisectTemp: d3.bisector((d) => {
			console.log(d);
		}).left,
		dryAdiabticLapseRate,
		range,
		mid,
	};
	// ? scales
	const linearDomain = [mid - range * 3, mid + range];
	const _scales = {
		linearDomain,
		linearSkewt: d3.scaleLinear().domain(linearDomain).ticks(24),
		// logPressure: d3.range(base, top - 50, increment),
		tangent: Math.tan((gradient || 55) * DEG2RAD),
		r: d3.scaleLinear().range([0, 300]).domain([0, 150]),
	};
	const _all = Array.from(dryAdiabticLapseRate, (dalrValue) => Array.from(_isoBars.ticks, () => dalrValue));
	const _buttons = {
		dryAdiabat: { highlight: false },
		moistAdiabat: { highlight: false },
		isohume: { highlight: false },
		isoTherms: { highlight: false },
		isoBars: { highlight: false },
	};
	const _checked = { isobar: true, isotherm: true, isopleth: true };
	return {
		data,
		options,
		T: {
			mid,
			range,
			skew: d3
				.scaleLinear()
				.domain([mid - range * 3, mid + range])
				.ticks(24),
		},
		P: {
			lines: d3.range(base, top - 50, increment),
			ticks: d3.range(base, top - 50, -25),
			top,
			increment,
			base,
			log: d3.range(base, top - 50, increment),
			// ticks: d3.range(base, top - 50, -25),
			at11km: pressureFromElevation(11000),
		},
		_checked,
		_styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
		_loadState: { initialized: false, loaded: false, sized: false, background: false },
		_windBarbs: { size: 15 },
		_refs: {
			// skewBackground: null
		},
		_isoTherms,
		_isoBars,
		_buttons,
		_scales,
		_all,
	};
};

export const useController = () => {
	const { state, setState } = useContext(Controller);
	return { state, setState };
};
// export const useController = { state, setState }=useContext(Controller)
// press: number, hght: number temp:number, dwpt:number, wdir: number, wspd: number
export type SkewCTX = {
	// _styles:React.CSSProperties

	data: { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
	options: { onEvent: { click: () => void; focus: () => void }; hover: () => void };
	P: { base: number; increment: number; top: number; at11km: number; log: number[]; ticks: number[]; lines: number[] };
	T: { mid: number; range: number; skew: number[] };
	_all: number[][];
	_styles: {
		margin: { top: number; right: number; bottom: number; left: number };
		height: number;
		width: number;
		xOffset: number;
	};
	_checked: {
		isotherm: boolean;
		isobar: boolean;
		isopleth: boolean;
	};
	_backgroundLines: { [key: string]: any };
	_isoTherms: { mid: number; range: number };
	_isoBars: { top: number; base: number; highlight: boolean; pAt11km: number };
	_selc: { [key: string]: d3.Selection<any, unknown, null, undefined> };
	_refs: {
		skewBackground: d3.Selection<any, unknown, null, undefined>;
		[key: string]: d3.Selection<any, unknown, null, undefined>;
	};
	_scales: {
		tangent: number;
		// linearScale: number[];
		linearSkewt: number[];
		logPressure: number[];
		linearDomain: number[];
		x: d3.ScaleLinear<number, number, never>;
		y: d3.ScaleLogarithmic<number, number, never>; //
	};
	_loadState: { initialized: boolean; loaded: boolean; sized: boolean; background: boolean };
	// _loadRequest: string
};
type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

export function useD3(refKey: string, render: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps: React.DependencyList) {
	// statful CTX
	const { state, setState }: { state: SkewCTX; setState: setSkewCTX } = useController();
	// refs
	const ref: React.MutableRefObject<any> = useRef();
	// memo'd state for effects
	const {
		// P,
		_refs: { skewContainer, skewSVG },
		_styles: { margin, width, height },
		_isoTherms: { mid, range },
		_isoBars: { top, base },
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
				.domain([mid - range * 2, mid + range * 2]); //range is width*2
			const y = d3.scaleLog().range([0, height]).domain([top, base]);

			// const x0 = d3.axisBottom(x).tickSize(0).ticks(20);//.orient("bottom");
			// const y0 = d3.axisLeft(y).tickSize(0).tickValues(P.lines.filter(p => (p % 100 === 0 || p === 50 || p === 150))).tickFormat(d3.format(".0d"));//.orient("left");
			// const y1 = d3.axisRight(y).tickSize(5).tickValues(P.ticks);//.orient("right");
			// // y2 = d3.axisLeft(y).tickSize(2).tickValues(altticks);

			setState(({ _loadState, _scales, _styles, ...oldState }) => {
				return {
					...oldState,
					_scales: { ..._scales, x, y },
					_styles: { ..._styles, width, height },
					_loadState: { ..._loadState, initialized: true },
				};
			});
			return true;
		},
		[base, margin, mid, range, top, setState]
	);
	// const shiftXAxis = useCallback(() => {
	// 	// let xOffset = this.xOffset;
	// 	// this._refs.clipper.attr('x', -xOffset);
	// 	// console.log(this._refs.xAxisValues);
	// 	// this._refs.xAxisValues.attr('transform', `translate(${xOffset}, ${this._styles.height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
	// 	// // console.log(this._refs.xAxisValues, root);
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
		//? render should return either a stateful object | [ null | void | undefined ]
		const newState = render(d3Ref);
		setState(({ _refs, ...oldState }: SkewCTX) =>
			// ? with the spread operator the refKey is added to the _refs
			({ ...{ ...newState, ...oldState }, _refs: { [refKey]: d3Ref, ..._refs } })
		);
	}, [ref, refKey, render, setState]);
	//! effects
	useEffect(() => (loaded ? window.addEventListener('resize', resize) : void 0), [loaded, resize]);

	// ! ignore typescript. only execute render when data changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => (!!render ? handleD3Render() : void 0), [...deps]);
	return { ref, state, setState, initializeVariables, resize };
}

export function useC2(initialState) {
	const [state, setState] = useState(() => (!!initialState ? makeIntialState(initialState) : null));
	return { state, setState };
}

const Controller: any = createContext(useC2);

export default function SkewtController({ data, options = { gradient: 45 }, ...props }) {
	console.log(data);
	const ctx = useC2({ data, options });
	return <Controller.Provider value={ctx} {...props} />;
}
