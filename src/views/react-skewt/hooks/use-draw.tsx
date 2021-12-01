import { useCallback, useMemo, useEffect } from 'react';
import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators';

export function useDraw({ P, T, _all, options: { stroke }, _styles: { height, width }, _scales: { x, y, tangent }, _d3Refs: { skewBackground }, parameters, ...state }) {
    // d3.LineGenerators
    // const elrLine = useMemo(() => elrLineGenerator({ x, y }, P.base, tangent), [x, y, P.base, tangent]);
    // const dalrLine = useMemo(() => dalrLineGenerator({ x, y }, P.log, P.base, tangent), [x, y, P, tangent]);
    // const malrLine = useMemo(() => malrLineGenerator({ x, y }, P, tangent, false), [x, y, P, tangent]);
    // const isohumeLine = useMemo(() => isohumeLineGenerator({ x, y }, P, tangent), [x, y, P, tangent]);

    //* staic background parameters

    // const bgParams = useMemo(() => {
    // 	const strokeOpacity = ['stroke-opacity', 0.5];
    // 	const clipPath = ['clip-path', 'url(#clipper)'];
    // 	const fill = ['fill', 'none'];
    // 	return {
    // 		//? Skewed Tempature Lines (SKEWT)
    // 		isotherms: (ref) =>
    // 			ref
    // 				.selectAll('isotherms')
    // 				.data(T.skew)
    // 				.enter()
    // 				.append('line')
    // 				.attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tangent)
    // 				.attr('x2', (d: number) => x(d) - 0.5)
    // 				.attr('y1', 0)
    // 				.attr('y2', height)
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				// .attr('class', (t: number) => `isotherm-line${t === 0 ? ' zero' : ''}`)
    // 				.attr('stroke', (d) => {
    // 					// console.log(d);
    // 					return stroke.primary;
    // 				}),

    // 		//? Logarithmic Pressure Lines (LOGP)
    // 		isobars: (ref) => {
    // 			const isobars: d3.Selection<SVGElement, {}, HTMLElement, any> = ref
    // 				.selectAll('isobars')
    // 				.data(P.log)
    // 				.enter()
    // 				.append('line')
    // 				.attr('x1', -width)
    // 				.attr('x2', 2 * width)
    // 				.attr('y1', y)
    // 				.attr('y2', y)
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				.attr('class', 'isobar')
    // 				.attr('id', 'isobar')
    // 				.attr('stroke', stroke.primary);
    // 			return isobars;
    // 		},

    // 		//? Environmental Lapse Rate (ELR)
    // 		environmentalLapseRate: (ref) => {
    // 			const elr: d3.Selection<SVGElement, {}, HTMLElement, any> = ref
    // 				.selectAll('envLapseRate')
    // 				.data([P.log.filter((p) => p > P.at11km).concat([P.at11km, 50])])
    // 				.enter()
    // 				.append('path')
    // 				.attr('d', elrLine)
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				.attr('class', `elr-line`)
    // 				.attr('stroke-width', 0.5)
    // 				.attr('stroke', stroke.primaryAlt);

    // 			return elr;
    // 		},

    // 		//? Lapse Rate (DALR)
    // 		dryAdiabticLapseRate: (ref) =>
    // 			ref //
    // 				.selectAll('DALR')
    // 				.data(_all)
    // 				.enter()
    // 				.append('path')
    // 				.attr('class', 'dalr-line')
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				.attr('d', dalrLine)
    // 				.attr('stroke', stroke.secondary),

    // 		//? Lapse Rate (MALR)
    // 		moistAdiabticLapseRate: (ref) =>
    // 			ref //
    // 				.selectAll('MALR')
    // 				.data(_all)
    // 				.enter()
    // 				.append('path')
    // 				.attr('class', 'malr-line')
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				.attr('d', malrLine)
    // 				.attr('stroke', stroke.secondaryAlt),

    // 		//?
    // 		isohumes: (ref) =>
    // 			ref //
    // 				.selectAll('isohumeline')
    // 				.data(_all)
    // 				.enter()
    // 				.append('path')
    // 				.attr('class', 'isohume-line')
    // 				.attr(...clipPath)
    // 				.attr(...strokeOpacity)
    // 				.attr(...fill)
    // 				.attr('d', isohumeLine)
    // 				.attr('stroke', stroke.primary),
    // 		//?
    // 		gridLines: (ref) =>
    // 			ref
    // 				.append('line')
    // 				.attr('x1', width - 0.5)
    // 				.attr('x2', width - 0.5)
    // 				.attr('y1', 0)
    // 				.attr('y2', height)
    // 				.attr('class', 'gridline')
    // 				.attr('stroke', stroke.primary),

    // 		//! NOT WORKING
    // 	};
    // }, [P, T, y, x, tangent, height, width, _all, dalrLine, elrLine, malrLine, isohumeLine, stroke]);
    // const derivedParameters = useMemo(() => ({}), []);

    // //* accepts the d3Selection for argument
    // const background = useCallback(
    // 	(ref) =>
    // 		//* returns {parameters:{...key:ref}}
    // 		({
    // 			parameters: Object.keys(bgParams).reduce((memo, key) => {
    // 				const d3Ref: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = bgParams[key](ref);
    // 				// d3Ref.attr()
    // 				return { ...memo, [key]: d3Ref };
    // 			}, {}),
    // 		}),
    // 	[bgParams]
    // );
    return {}
    // return useMemo(() => ({ background, derivedParameters }), [background, derivedParameters]);
}
