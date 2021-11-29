import { useEffect, useRef, useCallback, useState, useMemo, createContext, useContext } from 'react';
import * as d3 from 'd3';
import withDraw from './with-draw';
import { DEG2RAD, getElevation, pressureFromElevation } from '../util/atmosphere';

const makeIntialState = ({ data, options: { gradient, ...options } }) => {
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
		linearScale: d3.scaleLinear().domain(linearDomain).ticks(24),
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
	return {
		data,
		_styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
		_loadState: { initialized: false, loaded: false },
		_windBarbs: { size: 15 },
		_refs: {},
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
	_all: number[][];
	_styles: {
		margin: { top: number; right: number; bottom: number; left: number };
		height: number;
		width: number;
		xOffset: number;
	};
	_isoTherms: { mid: number; range: number };
	_isoBars: { top: number; base: number; highlight: boolean; lines: number[]; pAt11km: number };
	_selc: { [key: string]: d3.Selection<any, unknown, null, undefined> };
	_refs: { [key: string]: d3.Selection<any, unknown, null, undefined> };
	_scales: {
		tangent: number;
		linearScale: number[];
		linearDomain: number[];
		x: d3.ScaleLinear<number, number, never>;
		y: d3.ScaleLogarithmic<number, number, never>; //
	};
	_loadState: { initialized: boolean; loaded: boolean; sized: boolean };
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
		_refs: { skewContainer, skewSVG },
		_styles: { margin, width, height },
		_isoTherms: { mid, range },
		_isoBars: { top, base },
		_loadState: { loaded },
	} = useMemo(() => state, [state]);

	// ! ...callbacks
	const setVariables = useCallback(
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

			setState(({ _loadState, _scales, _styles, ...oldState }) => {
				console.log(refKey, divMain);
				return {
					...oldState,
					// _refs: { ..._refs, divMain },
					_scales: { ..._scales, x, y },
					_styles: { ..._styles, width, height },
					_loadState: { ..._loadState, initialized: true },
				};
			});
			return true;
		},
		[base, margin, mid, range, top, refKey, setState]
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
	const draw = useCallback((type: string) => withDraw(type, state), [state]);
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
		setState(({ _refs, ...oldState }: SkewCTX) => {
			// ? with the spread operator the refKey is added to the _refs
			_refs = { [refKey]: d3Ref, ..._refs };
			return {
				_refs,
				// ? if a staful content was return map the object keys
				...(!!newState
					? Object.keys(newState).reduce(
							(memo, k) => {
								if (typeof newState[k] === 'object') return { ...memo, ...{ [k]: { ...memo[k], ...newState[k] } } };
								else return { ...memo, ...{ [k]: newState[k] } };
							},
							//? ...deps
							{ _refs, ...oldState }
					  )
					: //? if not stateful content was return return only {_refs,...oldState}
					  oldState),
			};
		});
	}, [ref, refKey, render, setState]);
	//! effects
	useEffect(() => (loaded ? window.addEventListener('resize', resize) : void 0), [loaded, resize]);

	// ! ignore typescript. only execute render when data changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => (!!render ? handleD3Render() : void 0), [...deps]);
	return { ref, state, setState, setVariables, resize, draw };
}

export function useC2(initialState) {
	const [state, setState] = useState(() => (!!initialState ? makeIntialState(initialState) : null));
	return { state, setState };
}

const Controller: any = createContext(useC2);

export default function SkewtController({ data, options = { gradient: 45 }, ...props }) {
	const ctx = useC2({ data, options });
	return <Controller.Provider value={ctx} {...props} />;
}
