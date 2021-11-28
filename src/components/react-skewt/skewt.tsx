import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEG2RAD, getElevation, pressureFromElevation } from './util/atmosphere';
import SkewController, { useD3 } from './hooks/use-skewt';
import SkewBackground from './components/background';
import { SVGGElement, SVGRectElement } from './components/elements';
export default function SkewtLab({ data }: { data: { [key: string]: number }[] }) {
	return (
		<SkewController>
			<SkewMain data={data} />
		</SkewController>
	);
}

// const all = Array.from(dryAdiabticLapseRate, (dalrValue) => Array.from(_isoBars.ticks, () => dalrValue));
const makeIntialState = (gradient) => {
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
	const _scales = {
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
		_styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
		_windBarbs: { size: 15 },
		_initialized: false,
		_scales,
		_isoTherms,
		_isoBars,
		_buttons,
		_all,
		// _scale:
	};
};

function useDynamicCallbacks() {
	const resize = useCallback(() => {}, []);
	const shiftXAxis = useCallback(({ xOffset, _lines, _refs, _styles }) => {
		// let xOffset = this.xOffset;
		_refs.clipper.attr('x', -xOffset);
		// console.log(this._refs.xAxisValues);
		_refs.xAxisValues.attr('transform', `translate(${xOffset}, ${_styles.height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
		// console.log(this._refs.xAxisValues, root);
		// let xAxe = d3.select(_this._xAxisValues)._group;
		// console.log(xAxe).attr('transform', `translate(${xOffset}, ${height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
		for (let p in _lines) {
			_lines[p].attr('transform', `translate(${xOffset},0)`);
		}
		// dataAr.forEach((d) => {
		// 	for (let p in d.lines) {
		// 		d.lines[p].attr('transform', `translate(${xOffset},0)`);
		// 	}
		// });
	}, []);

	return { resize, shiftXAxis };
}

function SkewMain({ data, gradient = 45 }) {
	const [state, setState] = useState(() => makeIntialState(gradient));
	const {
		_styles: { margin },
		_isoTherms: { mid, range },
		_isoBars: { top, base },
		_initialized,
	} = useMemo(() => state, [state]);
	const withD3 = useCallback(
		(mainContainer) => {
			let width = parseInt(mainContainer.style('width'), 10) - 10;
			let height = width; //to fix
			width = width - margin.left - margin.right;
			height = width - margin.top - margin.bottom;
			const x = d3
				.scaleLinear()
				.range([-width / 2, width + width / 2])
				.domain([mid - range * 2, mid + range * 2]); //range is width*2
			// // .domain([midtemp - temprange * 2, midtemp + temprange * 2]); //range is width*2
			const y = d3.scaleLog().range([0, height]).domain([top, base]);
			setState(({ _scales, ...oldState }) => ({ ...oldState, _refs: { mainContainer }, _scales: { ..._scales, x, y }, _initialized: true }));
		},
		[margin, mid, top, base, range, setState]
	);
	const ref = useD3(withD3, [data.length]);
	useEffect(() => {
		console.log(state);
	}, [state]);

	return (
		<div ref={ref} className='skew-t'>
			{_initialized ? (
				<>
					<SkewSVG data={data} state={state} setState={setState} />
					<SkewClouds data={data} state={state} setState={setState} />
				</>
			) : null}
		</div>
	);
}
function SkewSVG({ data, state, setState }) {
	const withD3 = useCallback((elm) => {}, []);
	const ref = useD3(withD3, [data.length]);
	return (
		<svg ref={ref} className='mainsvg'>
			<SkewContainer data={data} state={state} setState={setState}>
				<SkewBackground data={data} state={state} setState={setState} />
				<SkewWindbarbs data={data} state={state} setState={setState} />
				<SkewTooltips data={data} state={state} setState={setState} />
				<SkewContainer data={data} state={state} setState={setState} />
			</SkewContainer>
		</svg>
	);
}

function SkewClouds({ data, state, setState, ...props }) {
	// console.log(state);
	return (
		<div className='cloud-container'>
			<CloudCanvas />
			<CloudCanvas />
		</div>
	);
}
function CloudCanvas() {
	return <canvas className='cloud' style={{ width: 1, height: 200 }} />;
}

function SkewContainer({ data, state, setState, ...props }) {
	const withD3 = useCallback((elm) => {}, []);
	return <SVGGElement className='' withD3={withD3} data={data} {...props} />;
}

function SkewWindbarbs({ data, state, setState }) {
	const withD3 = useCallback((elm) => {}, []);
	return <SVGGElement className='windbarb' withD3={withD3} data={data} />;
}

function SkewTooltips({ data, state, setState }) {
	const withD3 = useCallback((elm) => {}, []);
	return (
		<>
			<SVGGElement className='tooltips' withD3={withD3} data={data} />;
			<SVGRectElement className='overlay' withD3={withD3} data={data} />
		</>
	);
}

// /**@ELEMENTS */
// function SVGGElement({ withD3, data, ...props }) {
// 	const ref = useD3(withD3, [data.length]);
// 	return <g ref={ref} {...props} />;
// }

// function SVGRectElement({ withD3, data, ...props }) {
// 	const ref = useD3(withD3, [data.length]);
// 	return <g ref={ref} {...props} />;
// }

// export type SKEWTState = {
// 	options: {
// 		gradient: number;
// 		tangent: any;
// 		barbSize: number;
// 		altTicks: number[];
// 		onEvent?: (type: string) => void;
// 	};
// 	styles: {
// 		width: number;
// 		height: number;
// 		margin: { top: number; right: number; bottom: number; left: number };
// 	};
// 	_lines: {
// 		[key: string]: any;
// 	};
// 	axes: SKEWTAxes;
// 	scales: SKEWScale;
// 	_btns: { dryAdiabat: { active: boolean }; moistAdiabat: { active: boolean }; isohume: { active: boolean }; temp: { active: boolean }; pressure: { active: boolean } };
// 	_loadState: { vars: boolean; background: boolean };
// 	_temp: { mid: number; range: number };
// 	_pressure: { top: number; base: number; increment: number; ticks: number[]; lines: number[] };
// 	_moving: boolean;
// 	// _vars: boolean;
// 	// _background: boolean;
// };

// const makeAltTicks = function (altTicks: number[] = []) {
// 	for (let i = 0; i < 20000; i += 10000 / 3.28084) altTicks.push(pressureFromElevation(i));
// 	return altTicks;
// };
// const _pressure = { top: 100, base: 1050, increment: -50, ticks: [950, 900, 800, 750, 650, 600, 550, 450, 400, 350, 250, 150], lines: [1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 50] };
// const _btns = { dryAdiabat: { active: false }, moistAdiabat: { active: false }, isohume: { active: false }, temp: { active: false }, pressure: { active: false } };
// let x, y, xAxis0, yAxis0, yAxis1, yAxis2, width, height;
// const constantState = {
// 	styles: {
// 		width,
// 		height,
// 		margin: { top: 10, right: 25, bottom: 10, left: 25 },
// 	},
// 	scales: { x, y },
// 	axes: { xAxis0, yAxis0, yAxis1, yAxis2 },
// 	// axes: { xAxis0: undefined, yAxis0: undefined, yAxis1: undefined, yAxis2: undefined },
// 	_loadState: { moving: false, vars: false, background: false },
// 	_lines: {},
// 	_temp: { mid: 0, range: 60 },
// 	_moving: false,
// 	_pressure,
// 	_btns,
// 	// _vars: false,
// 	// _background: false,
// };

// export default function Skewt({ data, onEvent, gradient = 45 }: { data: TSounding; [x: string]: any }) {
// 	const [state, setState] = useState(() => {
// 		const initialState: SKEWTState = {
// 			...constantState,
// 			options: {
// 				gradient,
// 				onEvent,
// 				barbSize: 25,
// 				tangent: Math.tan(gradient * DEG2RAD),
// 				altTicks: makeAltTicks(),
// 			},
// 		};
// 		return initialState;
// 	});

// 	const {
// 		styles: { margin },
// 		options: { altTicks },
// 		_temp,
// 		_pressure,
// 	} = useMemo(() => state, [state]);

// 	const setVariables = useCallback(
// 		(ref: D3Selection) => {
// 			const width = parseInt(ref.style('width'), 10) - 10 - margin.left - margin.right; // tofix: using -10 to prevent x overflow
// 			const height = width - margin.top - margin.bottom;
// 			// const tan = Math.tan((gradient || 45) * DEG2RAD);
// 			const x = d3
// 				.scaleLinear()
// 				.range([-width / 2, width + width / 2])
// 				.domain([_temp.mid - _temp.range * 2, _temp.mid + _temp.range * 2]); //range is w*2
// 			const y = d3.scaleLog().range([0, height]).domain([_pressure.top, _pressure.base]);

// 			const xAxis0 = d3.axisBottom(x).tickSize(0).ticks(20); //.orient("bottom");
// 			const yAxis0 = d3
// 				.axisLeft(y)
// 				.tickSize(0)
// 				.tickValues(_pressure.lines.filter((p) => p % 100 === 0 || p === 50 || p === 150))
// 				.tickFormat(d3.format('.0d')); //.orient("left");

// 			const yAxis1 = d3.axisRight(y).tickSize(5).tickValues(_pressure.ticks); //.orient("right");
// 			const yAxis2 = d3.axisLeft(y).tickSize(2).tickValues(altTicks);
// 			const scales = { x, y };
// 			const axes = { xAxis0, yAxis0, yAxis1, yAxis2 };
// 			// console.log({ style: { width: w, height: h } });
// 			const _vars = true;
// 			setState(({ styles, _loadState, ...oldState }) => {
// 				return { ...oldState, styles: { ...styles, width, height }, _loadState: { ..._loadState, vars: true }, scales, axes, _vars };
// 			});
// 		},
// 		[margin, altTicks, _temp, _pressure]
// 	);
// 	// * onData => setVariables
// 	const ref = useD3(setVariables, [data.length]);
// 	return (
// 		<div ref={ref}>
// 			<MainSVG className='mainsvg' data={data} state={state} setState={setState}>
// 				{/* <Container className='container' data={data} state={state} setState={setState}> */}
// 				{/* <Overlay className='overlay' data={data} state={state} setState={setState} /> */}
// 				<Background className='skewtbg' data={data} state={state} setState={setState} />
// 				{/* </Container> */}
// 			</MainSVG>
// 		</div>
// 	);
// }
// interface SKEWTAxes {
// 	xAxis0: d3.Axis<d3.NumberValue>;
// 	yAxis0: d3.Axis<d3.NumberValue>;
// 	yAxis1: d3.Axis<d3.NumberValue>;
// 	yAxis2: d3.Axis<d3.NumberValue>;
// }
// interface SKEWScale {
// 	x: d3.ScaleLinear<number, number, never>;
// 	y: d3.ScaleLogarithmic<number, number, never>;
// }
// export type SKEWTProps = {
// 	[x: string]: any;
// 	data: TSounding;
// 	state: SKEWTState;
// 	setState: React.Dispatch<React.SetStateAction<SKEWTState>>;
// };
