import { useCallback, useMemo } from 'react';
import { useController } from '../controller/c2';
import type { SkewCTX, setSkewCTX } from './use-skewt';
export function useDraw() {
	/**@destructureState */
	const {
		state: {
			_styles: { height, width },
			scales: { x, y, tan } /**@scalesXYTan */,
			options: { palette } /**@PaletteOptions */,
			lineGen /**@d3lineGenerators */,
			_all,
			T,
			P /**@PressureObject */,
		},
	}: { state: SkewCTX; setState: setSkewCTX } = useController();

	/**@isobars //* Lines Of Equal Pressure */
	const isobars = useCallback(
		(d3Sel: d3.Selection<any, unknown, null, undefined>) => {
			const { stroke, opacity, fill } = palette.isobars;
			d3Sel
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
				.attr('clip-path', 'url(#clipper)');
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
				.attr('clip-path', 'url(#clipper)');
		},
		[P, T, x, y, tan, height, palette.isotherms]
	);

	/**@isohumes  //* Environmental Lapse Rate (ELR) */
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
			d3Sel
				.append('gridLines')
				.attr('x1', width)
				.attr('x2', width)
				.attr('y1', 0)
				.attr('y2', height)
				// .attr('class', 'gridline')
				.attr('stroke', stroke);
		},
		[width, height, palette.grid]
	);

	/**@memoizeBackground */
	const background = useMemo(
		() => ({ isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines }), //
		[isotherms, isobars, dryAdiabats, moistAdiabats, envLapseRate, isohumes, gridLines]
	);

	/**@callbackSwitchStatment */
	const all = useCallback(
		(type: string, d3Sel: d3.Selection<any, unknown, null, undefined>) => {
			switch (type) {
				case 'background':
					Object.values(background).forEach((drawFn) => drawFn(d3Sel));

					return;
				default:
					return;
			}
		},
		[background]
	);
	return { ...background, all };
}
