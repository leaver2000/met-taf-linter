import { useD3 } from '../hooks/use-skewt';
import { useCallback, useEffect } from 'react';
/**
 *### JSX-D3 `Component`
 * renders the `log-p` `skew-t` background Diagram
 */

export function Diagram({ ...props }) {
	/** destructure CTX from useD3 */
	const {
		ref,
		// eventHandler,
		state: {
			setHoverPosition,
			mainDims: { height, width },
			options: { palette } /**@PaletteOptions */,
			lineGen /**@d3lineGenerators */,
			scales,
			_all,
			T,
			P /**@PressureObject */,
		},
		setState,
		/** first arg
		 * - arg1: string -> d3Selection key
		 * - arg2: callback to render
		 */
	} = useD3('Diagram', (d3Sel: any) => drawDiagram(d3Sel), []); //
	const onEvent = useCallback(
		(key: string, e) => {
			// const { x, y, tan } = scales;
			// const temp = Math.round(x.invert(e.x));
			// const press = Math.round(y.invert(e.screenY - e.offsetY));

			switch (e.type) {
				case 'click':
					// dispatch({ time });
					break;
				case 'mouseover':
					// setState((...oldState)=>{
					// 	return oldState
					// })
					console.log(e.target.__data__);
					setHoverPosition(({ ...oldState }) => ({ ...oldState, [key]: e.target.__data__ }));
					// console.log({ press, temp });
					// setHover({ temp, press });
					break;
				case 'mousemove':
					// console.log(d.ctrlKey);
					// if (d.ctrlKey) {
					// 	dispatch({ time });
					// }
					// setHover({ time, temp });
					break;
				case 'mouseout':
					break;

				default:
					// console.log(d);
					break;
			}
		},
		[setHoverPosition]
	);
	/** render callback */
	const drawDiagram = useCallback(
		(d3Sel) => {
			const { x, y, tan } = scales;

			/**@isobars //* Lines Of Equal Pressure */
			const isobars = (({ stroke, opacity, fill }) =>
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
					.on('mouseover', (e) => onEvent('isobars', e))
					.attr('fill', fill)
					.attr('stroke', stroke))(palette.isobars);

			/**@isotherms //* Lines Of Equal Temperature */
			const isotherms = (({ stroke, opacity, fill }) =>
				d3Sel ////
					.selectAll('isotherms')
					.data(T.skew)
					.enter()
					.append('line')
					.attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tan)
					.attr('x2', (d: number) => x(d) - 0.5)
					.attr('y1', 0)
					.attr('y2', height)
					.on('mouseover', (e) => onEvent('isotherms', e))
					.attr('stroke-opacity', opacity)
					.attr('fill', fill)
					.attr('stroke', stroke))(palette.isotherms);

			/**@envLapseRate  //* Environmental Lapse Rate (ELR) */
			const envLapseRate = (({ stroke, opacity, fill }) =>
				d3Sel ////
					.selectAll('elr')
					.data([P.log.filter((p) => p > P.at11km).concat([P.at11km, 50])])
					.enter()
					.append('path')
					.attr('d', lineGen.elr)
					.attr('fill', fill)
					.attr('stroke', stroke)
					.attr('stroke-opacity', opacity))(palette.elr);

			/**@moistAdiabats //* Moist Adiabatic Lapse Rate (MALR) */
			const moistAdiabats = (({ stroke, opacity, fill }) =>
				d3Sel ////
					.selectAll('malr')
					.data(_all)
					.enter()
					.append('path')
					.attr('d', lineGen.malr)
					.attr('fill', fill)
					.attr('stroke', stroke)
					.attr('stroke-opacity', opacity))(palette.moistAdiabats);

			/**@dryAdiabats //* Dry Adiabatic Lapse Rate (DALR) */
			const dryAdiabats = (({ stroke, opacity, fill }) =>
				d3Sel ////
					.selectAll('dalr')
					.data(_all)
					.enter()
					.append('path')
					.attr('d', lineGen.dalr)
					.attr('fill', fill)
					.attr('stroke', stroke)
					.attr('stroke-opacity', opacity))(palette.dryAdiabats);
			/**@gridLines //* SkewT Diagram Gridlines */

			return { diagramLines: { isobars, isotherms, envLapseRate, dryAdiabats, moistAdiabats } };
		},
		[P, T, scales, _all, lineGen, palette, height, width, onEvent]
	);
	/**register the draw callback to CTX - used on Window Resize */
	useEffect(() => setState(({ ...oldState }) => ({ ...oldState, drawDiagram })), [setState, drawDiagram]);

	return <g ref={ref} clipPath='url(#clipper)' fillOpacity='.5' strokeWidth='.8' {...props} />;
}
