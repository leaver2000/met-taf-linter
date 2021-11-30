import { useCallback, useMemo, useEffect } from 'react';
import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators';
import { useD3 } from '../hooks/use-skewt';
function useDraw({ P, T, _all, _styles: { height, width }, _scales: { x, y, tangent }, _refs: { skewBackground } }) {
	// d3.LineGenerators
	const elrLine = useMemo(() => elrLineGenerator({ x, y }, P.base, tangent), [x, y, P.base, tangent]);
	const dalrLine = useMemo(() => dalrLineGenerator({ x, y }, P.log, P.base, tangent), [x, y, P, tangent]);
	const malrLine = useMemo(() => malrLineGenerator({ x, y }, P, tangent, false), [x, y, P, tangent]);
	const isohumeLine = useMemo(() => isohumeLineGenerator({ x, y }, P, tangent), [x, y, P, tangent]);

	//* staic background parameters
	const parameters = useMemo(
		() => ({
			//? Skewed Tempature Lines (SKEWT)
			isotherms: (ref) =>
				ref
					.selectAll('isotherms')
					.data(T.skew)
					.enter()
					.append('line')
					.attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tangent)
					.attr('x2', (d: number) => x(d) - 0.5)
					.attr('y1', 0)
					.attr('y2', height)
					.attr('clip-path', 'url(#clipper)')
					.attr('class', (t: number) => `isotherm-line${t === 0 ? ' zero' : ''}`),

			//? Logarithmic Pressure Lines (LOGP)
			isobars: (ref) =>
				ref
					.selectAll('isobars')
					.data(P.log)
					.enter()
					.append('line')
					.attr('x1', -width)
					.attr('x2', 2 * width)
					.attr('y1', y)
					.attr('y2', y)
					.attr('clip-path', 'url(#clipper)')
					.attr('class', 'isobar-line'),

			//? Environmental Lapse Rate (ELR)
			environmentalLapseRate: (ref) =>
				ref
					.selectAll('envLapseRate')
					.data([P.log.filter((p) => p > P.at11km).concat([P.at11km, 50])])
					.enter()
					.append('path')
					.attr('d', elrLine)
					.attr('clip-path', 'url(#clipper)')
					.attr('class', `elr-line`),

			//? Lapse Rate (DALR)
			dryAdiabticLapseRate: (ref) =>
				ref //
					.selectAll('DALR')
					.data(_all)
					.enter()
					.append('path')
					.attr('class', 'dalr-line')
					.attr('clip-path', 'url(#clipper)')
					.attr('d', dalrLine),

			//? Lapse Rate (MALR)
			moistAdiabticLapseRate: (ref) =>
				ref //
					.selectAll('MALR')
					.data(_all)
					.enter()
					.append('path')
					.attr('class', 'malr-line')
					.attr('clip-path', 'url(#clipper)')
					.attr('d', malrLine),

			//?
			isohumes: (ref) => ref.selectAll('isohumeline').data(_all).enter().append('path').attr('class', 'isohume-line').attr('clip-path', 'url(#clipper)').attr('d', isohumeLine),
			//?
			gridLines: (ref) =>
				ref
					.append('line')
					.attr('x1', width - 0.5)
					.attr('x2', width - 0.5)
					.attr('y1', 0)
					.attr('y2', height)
					.attr('class', 'gridline'),

			//! NOT WORKING
		}),
		[P, T, y, x, tangent, height, width, _all, dalrLine, elrLine, malrLine, isohumeLine]
	);
	const derivedParameters = useMemo(() => ({}), []);

	//* accepts the d3Selection for argument
	const background = useCallback(
		(ref) =>
			//* returns {parameters:{...key:ref}}
			({
				parameters: Object.keys(parameters).reduce((memo, key) => {
					return { ...memo, [key]: parameters[key](ref) };
				}, {}),
			}),
		[parameters]
	);

	return useMemo(() => ({ background, derivedParameters }), [background, derivedParameters]);
}

export default function Background({ ...props }) {
	//P = pressure | T =temperature
	const { ref, state } = useD3('skewBackground', (bgRef) => draw.background(bgRef), []);
	const draw = useDraw(state);
	useEffect(() => {}, []);

	return <g className='skew-background' ref={ref} {...props} />;
}
