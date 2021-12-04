// import { useCallback, useEffect, useMemo, useReducer } from 'react';
// // import { Diagram } from '../components/diagram';
// import * as d3 from 'd3';
// import { useC2 } from '../controller/c2';
// import type { SkewCTX, setSkewCTX } from './use-skewt';

// export function useDraw() {
// 	const [{ hoverEvent }, setEvent] = useReducer(
// 		(prevState, { type, ...state }) => {
// 			switch (type) {
// 				case 'hoverEvent':
// 					const { hoverEvent, ...oldState } = prevState;
// 					return { ...oldState, hoverEvent: { ...hoverEvent, ...state } };

// 				default:
// 					return prevState;
// 			}
// 		},
// 		{ hoverEvent: { isotherm: null, isobar: null } }
// 	);

// 	/**@destructureState */
// 	const {
// 		state: {
// 			mainDims: { height, width },
// 			scales: { x, y, tan } /**@scalesXYTan */,
// 			options: { palette, onEvent } /**@PaletteOptions */,
// 			lineGen /**@d3lineGenerators */,
// 			d3Refs: { Diagram, Sounding, Ticks },
// 			scales,
// 			datums,
// 			_all,
// 			axes,
// 			T,
// 			P /**@PressureObject */,
// 		},
// 	}: { state: SkewCTX; setState: setSkewCTX } = useC2();

// 	/**@temperature  //* Sounding Temperature */
// 	const temperature = useCallback(
// 		(d3Sel) => {
// 			const { stroke, opacity, fill } = palette.temperature;
// 			d3Sel //
// 				.selectAll('temperature')
// 				.data(datums)
// 				.enter()
// 				.append('path')
// 				.attr('stroke-opacity', opacity)
// 				// .attr('stroke-width', 1.5)
// 				.attr('fill', fill)
// 				.attr('stroke', stroke)
// 				.attr('d', lineGen.temp)
// 				.attr('clip-path', 'url(#clipper)');
// 		},
// 		[datums, lineGen.temp, palette.temperature]
// 	);
// 	/**@dewpoint  //* Sounding Dew Point */
// 	const dewpoint = useCallback(
// 		(d3Sel) => {
// 			const { stroke, fill, opacity } = palette.dewpoint;
// 			const { click } = onEvent;
// 			// 	var xScale = d3.scale.linear()
// 			// 	.domain([0, d3.max(dataset, function (d) {
// 			// 	return d[0];
// 			// })])
// 			d3Sel ////
// 				.selectAll('dewpoint')
// 				.data(datums)
// 				.enter()
// 				.append('path')
// 				.attr('fill', fill)
// 				.attr('stroke', stroke)
// 				.attr('stroke-opacity', opacity)
// 				// .attr('stroke-width', 1.5)
// 				// .on('mouseout', ({ x, y }, dataset) => {
// 				// 	hover({
// 				// 		type: 'mouseout',
// 				// 		temp: scales.x.invert(x),
// 				// 		mbar: scales.y.invert(y),
// 				// 	});
// 				// })

// 				.on('click', ({ x, y }, dataSet) => {
// 					click({
// 						temp: scales.x.invert(x),
// 						mbar: scales.y.invert(y),
// 					});
// 				})
// 				.attr('d', lineGen.temp)
// 				.attr('d', lineGen.dewpt)
// 				.attr('clip-path', 'url(#clipper)');
// 		},
// 		[datums, lineGen.temp, lineGen.dewpt, palette.dewpoint, onEvent, scales]
// 	);

// 	// const ticks = useCallback(
// 	// 	(d3Sel) => {
// 	// 		const { x0, y0, y1, y2 } = axes;
// 	// 		d3Sel
// 	// 			.append('g')
// 	// 			.attr('class', 'x axis')
// 	// 			.attr('transform', 'translate(0,' + (height - 0.5) + ')')
// 	// 			.call(x0);
// 	// 		// .attr('clip-path', 'url(#clipper)');
// 	// 		d3Sel.append('g').attr('class', 'y axis').attr('transform', 'translate(-0.5,0)').call(y0);
// 	// 		d3Sel.append('g').attr('class', 'y axis ticks').attr('transform', 'translate(-0.5,0)').call(y1);
// 	// 		d3Sel.append('g').attr('class', 'y axis hght-ticks').attr('transform', 'translate(-0.5,0)').call(y2);
// 	// 	},
// 	// 	[height, axes]
// 	// );

// 	// /**@gridLines //* SkewT Diagram Gridlines */
// 	// const gridLines = useCallback(
// 	// 	(d3Sel: d3.Selection<any, unknown, null, undefined>) => {
// 	// 		const { stroke } = palette.grid;
// 	// 		d3Sel.append('gridLines').attr('x1', width).attr('x2', width).attr('y1', 0).attr('y2', height).attr('stroke', stroke);
// 	// 	},
// 	// 	[width, height, palette.grid]
// 	// );

// 	// drawAllbackground =>isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines

// 	// draw Temp and Dewpoint = >temperature, dewpoint
// 	const envMemo = useMemo(() => [temperature, dewpoint], [temperature, dewpoint]);
// 	const sounding = useCallback((d3Sel) => envMemo.forEach((drawFn) => drawFn(d3Sel)), [envMemo]);

// 	useEffect(() => {
// 		if (!!hoverEvent.isobar && !!hoverEvent.isotherm) onEvent.hover(hoverEvent);
// 	}, [onEvent, hoverEvent]);

// 	// eslint-disable-next-line no-sequences
// 	const clearThenDraw = useCallback((ref, draw) => (ref.selectAll('*').remove(), draw(ref)), []);

// 	//
// 	// useEffect(() => {
// 	// 	// if (!!Diagram) clearThenDraw(Diagram, diagram);
// 	// 	if (!!Sounding) clearThenDraw(Sounding, sounding);
// 	// 	// if (!!Ticks) clearThenDraw(Ticks, ticks);
// 	// }, [width, height, Diagram, Sounding, sounding, clearThenDraw]);

// 	return { ...envMemo, sounding };
// }
export {};
