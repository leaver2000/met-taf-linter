import { useCallback, useEffect, useMemo, useReducer } from 'react';
// import { Diagram } from '../components/diagram';
import * as d3 from 'd3';
import { useC2 } from '../controller/c2';
import type { SkewCTX, setSkewCTX } from './use-skewt';

export function useDraw() {
	const [{ hoverEvent }, setEvent] = useReducer(
		(prevState, { type, ...state }) => {
			switch (type) {
				case 'hoverEvent':
					const { hoverEvent, ...oldState } = prevState;
					return { ...oldState, hoverEvent: { ...hoverEvent, ...state } };

				default:
					return prevState;
			}
			// console.log(type, state);
			// return {prevState};
		},
		{ hoverEvent: { isotherm: null, isobar: null } }
	);
	// console.log(hoverEvent);
	// const [{}];
	/**@destructureState */
	const {
		state: {
			mainDims: { height, width },
			scales: { x, y, tan } /**@scalesXYTan */,
			options: { palette, onEvent } /**@PaletteOptions */,
			lineGen /**@d3lineGenerators */,
			d3Refs: { Diagram },
			scales,
			datums,
			_all,
			T,
			P /**@PressureObject */,
		},
	}: { state: SkewCTX; setState: setSkewCTX } = useC2();

	/**@temperature  //* Sounding Temperature */
	const temperature = useCallback(
		(d3Sel) => {
			const { stroke, opacity, fill } = palette.temperature;
			d3Sel //
				.selectAll('temperature')
				.data(datums)
				.enter()
				.append('path')
				.attr('stroke-opacity', opacity)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('d', lineGen.temp)
				.attr('clip-path', 'url(#clipper)');
		},
		[datums, lineGen.temp, palette.temperature]
	);
	/**@dewpoint  //* Sounding Dew Point */
	const dewpoint = useCallback(
		(d3Sel) => {
			const { stroke, fill, opacity } = palette.dewpoint;
			const { click } = onEvent;
			// 	var xScale = d3.scale.linear()
			// 	.domain([0, d3.max(dataset, function (d) {
			// 	return d[0];
			// })])
			d3Sel ////
				.selectAll('dewpoint')
				.data(datums)
				.enter()
				.append('path')
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('stroke-opacity', opacity)
				.attr('stroke-width', 3)
				// .on('mouseout', ({ x, y }, dataset) => {
				// 	hover({
				// 		type: 'mouseout',
				// 		temp: scales.x.invert(x),
				// 		mbar: scales.y.invert(y),
				// 	});
				// })

				.on('click', ({ x, y }, dataSet) => {
					click({
						temp: scales.x.invert(x),
						mbar: scales.y.invert(y),
					});
				})
				.attr('d', lineGen.temp)
				.attr('d', lineGen.dewpt)
				.attr('clip-path', 'url(#clipper)');
		},
		[datums, lineGen.temp, lineGen.dewpt, palette.dewpoint, onEvent, scales]
	);

	/**@isobars //* Lines Of Equal Pressure */
	const isobars = useCallback(
		(d3Sel: d3.Selection<SVGGElement, number[], any, any>) => {
			const { stroke, opacity, fill } = palette.isobars;
			d3Sel ////
				.selectAll('isobars')
				.data(P.log)
				.enter()
				.append('line')
				.attr('x1', -width)
				.attr('x2', 2 * width)
				.attr('y1', y)
				.attr('y2', y)
				.attr('stroke-opacity', opacity)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('clip-path', 'url(#clipper)')
				.on('mouseover', ({ path: line }) => {
					const isobar = line[0].__data__;
					setEvent({ type: 'hoverEvent', isobar });
					// setEvent(({ hoverEvent, ...old }) => ({ ...old, hoverEvent: { ...hoverEvent, isoB } }));
				});
		},
		[P, width, y, palette.isobars]
	);

	/**@isotherms //* Lines Of Equal Temperature */
	const isotherms = useCallback(
		(d3Sel: d3.Selection<any, unknown, null, undefined>) => {
			const { stroke, opacity, fill } = palette.isotherms;

			d3Sel
				.selectAll('isotherms')
				.data(T.skew)

				.enter()
				.append('line')
				.attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tan)
				.attr('x2', (d: number) => x(d) - 0.5)
				.attr('y1', 0)
				.attr('y2', height)
				.attr('stroke-opacity', opacity)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('clip-path', 'url(#clipper)')
				.on(
					'mouseover',
					({ path: line }) => setEvent({ type: 'hoverEvent', isotherm: line[0].__data__ })
					// const isoT = line[0].__data__;
					// setEvent(({ hoverEvent, ...old }) => ({ ...old, hoverEvent: { ...hoverEvent, isotherm: line[0].__data__ } }))
				);
		},
		[P, T, x, y, tan, height, palette.isotherms]
	);

	useEffect(() => {
		if (!!hoverEvent.isobar && !!hoverEvent.isotherm) onEvent.hover(hoverEvent);
	}, [onEvent, hoverEvent]);
	const isohumes = useCallback(
		(d3Sel) => {
			const { stroke, opacity, fill } = palette.isohumes;
			d3Sel //
				.selectAll('isohumes')
				.data(_all)
				.enter()
				.append('path')
				.attr('d', lineGen.isohume)
				.attr('stroke-opacity', opacity)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('stroke-dasharray', 5)
				.attr('clip-path', 'url(#clipper)');
		},
		[_all, lineGen.isohume, palette]
	);
	/**@envLapseRate  //* Environmental Lapse Rate (ELR) */
	const envLapseRate = useCallback(
		(d3Sel) => {
			const { stroke, opacity, fill } = palette.elr;
			d3Sel
				.selectAll('elr')
				.data([P.log.filter((p) => p > P.at11km).concat([P.at11km, 50])])
				.enter()
				.append('path')
				.attr('d', lineGen.elr)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('stroke-opacity', opacity)
				.attr('clip-path', 'url(#clipper)');
		},
		[P, lineGen.elr, palette.elr]
	);
	/**@moistAdiabats //* Moist Adiabatic Lapse Rate (MALR) */
	const moistAdiabats = useCallback(
		(d3Sel) => {
			const { stroke, opacity, fill } = palette.moistAdiabats;
			d3Sel //
				.selectAll('malr')
				.data(_all)
				.enter()
				.append('path')
				.attr('d', lineGen.malr)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('stroke-opacity', opacity)
				.attr('clip-path', 'url(#clipper)');
		},
		[_all, palette.moistAdiabats, lineGen.malr]
	);

	/**@dryAdiabats //* Dry Adiabatic Lapse Rate (DALR) */
	const dryAdiabats = useCallback(
		(d3Sel) => {
			const { stroke, opacity, fill } = palette.dryAdiabats;
			d3Sel //
				.selectAll('dalr')
				.data(_all)
				.enter()
				.append('path')
				.attr('d', lineGen.dalr)
				.attr('fill', fill)
				.attr('stroke', stroke)
				.attr('stroke-opacity', opacity)
				.attr('clip-path', 'url(#clipper)');
		},
		[_all, lineGen.dalr, palette.dryAdiabats]
	);

	/**@gridLines //* SkewT Diagram Gridlines */
	const gridLines = useCallback(
		(d3Sel: d3.Selection<any, unknown, null, undefined>) => {
			const { stroke } = palette.grid;
			d3Sel.append('gridLines').attr('x1', width).attr('x2', width).attr('y1', 0).attr('y2', height).attr('stroke', stroke);
		},
		[width, height, palette.grid]
	);

	/**@memoizeCallbacks */
	const bgMemo = useMemo(
		() => [isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines], //
		[isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines]
	);
	// drawAllbackground =>isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines
	const background = useCallback((d3Sel) => bgMemo.forEach((drawFn) => drawFn(d3Sel)), [bgMemo]);

	// draw Temp and Dewpoint = >temperature, dewpoint
	const envMemo = useMemo(() => [temperature, dewpoint], [temperature, dewpoint]);
	const sounding = useCallback((d3Sel) => envMemo.forEach((drawFn) => drawFn(d3Sel)), [envMemo]);

	useEffect(() => {
		if (!!Diagram) {
			sounding(Diagram);
			background(Diagram);
		}
	}, [width, height, Diagram, background, sounding]);

	return { ...bgMemo, ...envMemo, background, sounding };
}
