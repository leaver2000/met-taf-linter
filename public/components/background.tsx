import React, { useEffect, useCallback, useState, useReducer, useMemo } from 'react';
import useD3 from '../hooks/use-skewt';
import * as d3 from 'd3';
import { pressureFromElevation, dryLapse, getElevation2, getElevation, DEG2RAD, K0, moistGradientT } from '../util/atmosphere';
import type { SKEWTProps, SKEWTState } from '../skewt';

// type SKEWTState = {
// 	options: { gradient: number; barbSize: number; altTicks: number[] };
// 	styles: {
// 		margin: { top: number; right: number; bottom: number; left: number };
// 	};
// 	axes: SKEWTAxes;
// 	scales: SKEWScale;
// 	_temp: { mid: number; range: number };
// 	_pressure: { top: number; base: number; increment: number; ticks: number[]; lines: number[] };
// 	_moving: boolean;
// 	_vars: boolean;
// 	_background: boolean;
// };	ref: D3Selection, {{scales:{x,y}}_temp,tan,_pressure,}, //
// export interface Line<Datum> {
// 	(data: Datum[]): string | null;
// }
// interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
// 	//...
// 	attr(name: string, value: ValueFn<GElement, Datum, string | number | boolean | null>): this;
// 	//...
//   }
// xAxis0: d3.Axis<d3.NumberValue>;
// yAxis0: d3.Axis<d3.NumberValue>;
// yAxis1: d3.Axis<d3.NumberValue>;
// yAxis2: d3.Axis<d3.NumberValue>;
//...
// const buttons = { dryAdiabat: { active: false }, moistAdiabat: { active: false }, isohume: { active: false }, temp: { active: false }, pressure: { active: false } };
function handleDraw(
	ref: D3Selection,
	{
		scales: { x, y }, //
		axes: { xAxis0, yAxis0, yAxis1, yAxis2 },
		options: { tangent },
		styles: { width, height },
		_btns,
		_temp,
		_pressure,
		_moving,
	}, //
	setState: React.Dispatch<React.SetStateAction<SKEWTState>>
) {
	// const { tangent } = options;
	// const clipper = ref
	// 	.append('clipPath') //
	// 	.attr('id', 'clipper')
	// 	.append('rect')
	// 	.attr('x', 0)
	// 	.attr('y', 0)
	// 	.attr('width', width)
	// 	.attr('height', height);
	// const TEMP = ref
	// 	.selectAll('templine')
	// 	.data(
	// 		d3
	// 			.scaleLinear()
	// 			.domain([_temp.mid - _temp.range * 3, _temp.mid + _temp.range])
	// 			.ticks(24)
	// 	)
	// 	.enter()
	// 	.append('line')
	// 	.attr('x1', (d) => x(d) - 0.5 + (y(_pressure.base) - y(_pressure.top)) / tangent)
	// 	.attr('x2', (d) => x(d) - 0.5)
	// 	.attr('y1', 0)
	// 	.attr('y2', height);
	// const pAt11km = pressureFromElevation(11000);
	// var pp = _moving
	// 	? [
	// 			_pressure.base,
	// 			_pressure.base - (_pressure.base - _pressure.top) * 0.25,
	// 			_pressure.base - (_pressure.base - _pressure.top) * 0.5, //
	// 			_pressure.base - (_pressure.base - _pressure.top) * 0.75,
	// 			_pressure.top,
	// 	  ] //
	// 	: d3.range(_pressure.base, _pressure.top - 50, _pressure.increment);

	// // //console.log(pAt11km);
	// //? Environmental Lapse Rate Lines (ELR)
	// let showElr = false;

	// const elrFX = d3
	// 	.line()
	// 	.curve(d3.curveLinear)
	// 	.x((d: number[]) => {
	// 		let t = Number(d) > pAt11km ? 15 - getElevation(d) * 0.00649 : -56.5; //*6.49 deg per 1000 m
	// 		return x(t) + (y(_pressure.base) - y(d)) / tangent;
	// 	})
	// 	.y((d) => y(d));
	// // console.log(elrFX());
	// const ELR = ref
	// 	.selectAll('elr')
	// 	.data([_pressure.lines.filter((p: number) => p > pAt11km).concat([pAt11km, 50])])
	// 	.enter()
	// 	.append('path')
	// 	.attr('d', (...args) => {
	// 		console.log(args);
	// 		return elrFX([]);
	// 	})
	// 	.attr('clip-path', 'url(#clipper)')
	// 	.attr('class', `elr ${showElr ? 'highlight-line' : ''}`);

	// //? Logarithmic pressure Lines (LOGP)
	// const LOGP = ref
	// 	.selectAll('pressureline')
	// 	.data(_pressure.lines)
	// 	.enter()
	// 	.append('line')
	// 	.attr('x1', -width)
	// 	.attr('x2', 2 * width)
	// 	.attr('y1', y)
	// 	.attr('y2', y)
	// 	.attr('clip-path', 'url(#clipper)')
	// 	.attr('class', `pressure ${_btns.pressure.active ? 'highlight-line' : ''}`);
	// // console.log(_btn.)
	// //? Dry Adiabatic Lapse Rate Lines (DALR)
	// const dalrArray = d3
	// 	.scaleLinear()
	// 	.domain([_temp.mid - _temp.range * 2, _temp.mid + _temp.range * 4])
	// 	.ticks(36);

	// // const all: number[][] = [];
	// const dalrNDArray: number[][] = Array.from(dalrArray, (dalrValue) => Array.from(pp, () => dalrValue));
	// // const all
	// // for (var i = 0; i < dalrArray.length; i++) {
	// // 	var z: number[] = [];
	// // 	for (var j = 0; j < pp.length; j++) {
	// // 		z.push(dalrArray[i]);
	// // 	}
	// // 	all.push(z);
	// // }
	// var dalrFX = d3
	// 	.line()
	// 	.curve(d3.curveLinear)
	// 	.x((d, i) => {
	// 		let dalrX = x(dryLapse(pp[i], K0 + Number(d), _pressure.base) - K0) + (y(_pressure.base) - y(pp[i])) / tangent;
	// 		return dalrX;
	// 	})

	// 	.y((_, i) => {
	// 		return y(pp[i]);
	// 	});

	// // // // Draw dry adiabats
	// const DALR = ref
	// 	.selectAll('dryadiabatline')
	// 	.data(dalrNDArray)
	// 	.enter()
	// 	.append('path')
	// 	.attr('d', (...args) => {
	// 		console.log(args);
	// 		return dalrFX([]);
	// 	})
	// 	.attr('class', `dryadiabat  ${_btns.dryAdiabat.active ? 'highlight-line' : ''}`)
	// 	.attr('clip-path', 'url(#clipper)');

	// // // moist adiabat fx
	// var temp: number;
	// var moistlineFx = d3
	// 	.line()
	// 	.curve(d3.curveLinear)
	// 	.x(function (d, i) {
	// 		if (i === 0) {
	// 			temp = K0 + Number(d);
	// 		} else {
	// 			temp = +moistGradientT(pp[i], temp) * (_moving ? (_pressure.top - _pressure.base) / 4 : _pressure.increment);
	// 		}
	// 		console.log(temp);
	// 		return x(temp - K0) + (y(_pressure.base) - y(pp[i])) / tangent;

	// 		// temp = i === 0 ? K0 + Number(d) : temp + moistGradientT(pp[i], temp) * (_moving ? (_pressure.top - _pressure.base) / 4 : _pressure.increment);
	// 		// return x(temp - K0) + (y(_pressure.base) - y(pp[i])) / tangent;
	// 	})
	// 	.y(function (d, i) {
	// 		return y(pp[i]);
	// 	});

	// // Draw moist adiabats
	// const moistadiabat = ref
	// 	.selectAll('moistadiabatline')
	// 	.data(dalrNDArray)
	// 	.enter()
	// 	.append('path')
	// 	.attr('class', `moistadiabat ${_btns.moistAdiabat.active ? 'highlight-line' : ''}`)
	// 	.attr('clip-path', 'url(#clipper)');
	// // .attr('d', moistlineFx);

	// // // isohume fx
	// // var mixingRatio;
	// // var isohumeFx = d3.line()
	// // 	.curve(d3.curveLinear)
	// // 	.x(function(d,i) {
	// // 		//console.log(d);
	// // 		if (i==0) mixingRatio = atm.mixingRatio(atm.saturationVaporPressure(d + K0), pp[i]);
	// // 		temp = atm.dewpoint(atm.vaporPressure(pp[i], mixingRatio));
	// // 		return x(temp - K0) + (y(_pressure.base)-y(pp[i]))/tan;
	// // 	})
	// // 	.y(function(d,i) { return y(pp[i])} );

	// // // Draw isohumes
	// // const =isohume = ref.selectAll("isohumeline")
	// // 	.data(all)
	// // 	.enter().append("path")
	// // 	.attr("class", `isohume ${buttons["Isohume"].hi?"highlight-line":""}` )
	// // 	.attr("clip-path", "url(#clipper)")
	// // 	.attr("d", isohumeFx);

	// // // Line along right edge of plot
	// // ref.append("line")
	// // 	.attr("x1", styles.width-0.5)
	// // 	.attr("x2", styles.width-0.5)
	// // 	.attr("y1", 0)
	// // 	.attr("y2", styles.height)
	// // 	.attr("class", "gridline");

	// // // Add axes
	// // xAxisValues=ref.append("g").attr("class", "x axis").attr("transform", "translate(0," + (styles.height-0.5) + ")").call(xAxis).attr("clip-path", "url(#clipper)")  ;
	// // ref.append("g").attr("class", "y axis").attr("transform", "translate(-0.5,0)").call(yAxis);
	// // ref.append("g").attr("class", "y axis ticks").attr("transform", "translate(-0.5,0)").call(yAxis2);
	// // ref.append("g").attr("class", "y axis hght-ticks").attr("transform", "translate(-0.5,0)").call(yAxis3);

	// // const lines = { temp };
	// // // .attr("class",  d=> d == 0 ?  `tempzero ${buttons["Temp"].hi?"highlight-line":""}`: `templine ${buttons["Temp"].hi?"highlight-line":""}`)
	// // .attr('clip-path', 'url(#clipper)');xAxis0,yAxis0,yAxis1,yAxis2
	// const _lines = { TEMP, ELR, LOGP };
	// console.log(_lines);
	// // xAxisValues=ref.append("g").attr("class", "x axis").attr("transform", "translate(0," + (h-0.5) + ")").call(xAxis0).attr("clip-path", "url(#clipper)")  ;
	// // ref.append('g').attr('class', 'y axis').attr('transform', 'translate(-0.5,0)').call(yAxis0);
	// // ref.append('g').attr('class', 'y axis ticks').attr('transform', 'translate(-0.5,0)').call(yAxis1);
	// // skewtbg.append("g").attr("class", "y axis hght-ticks").attr("transform", "translate(-0.5,0)").call(yAxis2);
	ref //
		.append('clipPath')
		.attr('id', 'clipper')
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', width)
		.attr('height', height);

	ref //
		.selectAll('templine')
		.data(d3.range(-100, 45, 10))
		.enter()
		.append('line')
		.attr('x1', function (d) {
			return x(d) - 0.5 + (y(_pressure.base) - y(100)) / tangent;
		})
		.attr('x2', function (d) {
			return x(d) - 0.5;
		})
		.attr('y1', 0)
		.attr('y2', height)
		.attr('class', function (d) {
			if (d == 0) {
				return 'tempzero';
			} else {
				return 'gridline';
			}
		})
		.attr('clip-path', 'url(#clipper)');

	ref //
		.selectAll('pressureline')
		.data(_pressure.lines)
		.enter()
		.append('line')
		.attr('x1', 0)
		.attr('x2', width)
		.attr('y1', function (d) {
			return y(d);
		})
		.attr('y2', function (d) {
			return y(d);
		})
		.attr('class', 'gridline');
	// create array to plot dry adiabats
	var pp = d3.range(_pressure.top, _pressure.top + 1, 10);
	var dalrArray = d3.range(-30, 240, 20);
	const dalrNDArray: number[][] = Array.from(d3.range(-30, 240, 20), (dalrValue) => Array.from(pp, () => dalrValue));
	// var dryad:number[] = d3.range(-30,240,20);
	// var all = [];
	// for (var i=0; i<dryad.length; i++) {
	// 	var z = [];
	// 	for (var j=0; j<pp.length; j++) { z.push(dryad[i]); }
	// 		all.push(z);
	// }

	var drylineFx = d3
		.line()
		.curve(d3.curveLinear)
		.x(function (d, i) {
			return x(dryLapse(pp[i], K0 + d[0], _pressure.base) - K0) + (y(_pressure.base) - y(pp[i])) / tangent;
		})
		.y(function (d, i) {
			return y(pp[i]);
		});
	// var dryline = d3.line()
	// .interpolate("linear")
	// .x(function(d,i) { return x( ( 273.15 + d ) / Math.pow( (1000/pp[i]), 0.286) -273.15) + (y(_pressure.base)-y(pp[i]))/tangent;})
	// .y(function(d,i) { return y(pp[i])} );

	// Draw dry adiabats

	// var dryadiabat = ref.selectAll("dryadiabatline")
	// .data(dalrNDArray)
	// .enter().append("path")
	// // .attr("class", `dryadiabat  ${buttons["Dry Adiabat"].hi?"highlight-line":""}` )
	// .attr("clip-path", "url(#clipper)")
	// .attr("d", drylineFx);
	// ref.selectAll('dryadiabatline').data(dalrNDArray).enter().append('path').attr('class', 'gridline').attr('clip-path', 'url(#clipper)').attr('d', dryline);
	ref
		.append('line')
		.attr('color', 'green')
		.attr('x1', width - 0.5)
		.attr('x2', width - 0.5)
		.attr('y1', 0)
		.attr('y2', height)
		.attr('class', 'gridline');
	ref
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + (height - 0.5) + ')')
		.call(xAxis0);

	ref.append('g').attr('class', 'y axis').attr('transform', 'translate(-0.5,0)').call(yAxis0);
	ref.append('g').attr('class', 'y axis ticks').attr('transform', 'translate(-0.5,0)').call(yAxis1);
}

export default function Background({ data, state, setState, ...props }: SKEWTProps) {
	// const { margin, gradient, _temp.mid, _temp.range, pTop, pBase, pTicks, _pressure.lines, _pressure.increment, x, y, styles.height, styles.width, tan, _vars, _moving } = useMemo(() => state, [state]);
	const {
		scales,
		axes,
		styles,
		options,
		_temp,
		_pressure,
		_moving,
		_btns,
		_loadState: { vars },
	} = useMemo(() => state, [state]);

	const drawBackground = useCallback(
		(ref: D3Selection) => handleDraw(ref, { scales, axes, styles, options, _btns, _moving, _temp, _pressure }, setState), //
		[scales, axes, options, _btns, styles, _temp, _pressure, _moving, setState]
	);

	// function resize() {
	// 	skewtbg.selectAll("*").remove();
	// 	// setVariables();
	// 	// svg.attr("width", w + margin.right + margin.left).attr("height", h + margin.top + margin.bottom);
	// 	// container.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// 	// drawBackground();
	// 	// makeBarbTemplates();
	// 	// plot(data);
	// }
	const resize = useCallback(
		(_ref) => {
			// _ref.selectAll('*').remove();
			drawBackground(_ref);
		},
		[drawBackground]
	);

	console.log(vars);
	const ref = useD3(vars ? resize : void 0, [data.length]);
	return <g ref={ref} className='container' {...props} />;
}
