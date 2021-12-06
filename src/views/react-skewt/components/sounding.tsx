import { useState } from 'react';
import { useD3 } from '../hooks/use-skewt';
import { useCallback, useEffect } from 'react';
/**
 *### JSX-D3 `Component`
 * renders the the Axes ticks on the left and bottom of the background Diagram
 */
export function Sounding({ ...props }) {
	const [datums, setDatums] = useState<any>(null);
	const {
		ref,
		state: {
			options: { palette } /**@PaletteOptions */,
			lineGen /**@d3lineGenerators */,
			data,
		},
		setState,
	} = useD3(
		'Sounding',
		(d3Sel) => {
			if (!!datums) {
				drawSounding(d3Sel);
				return { datums };
			}
		},
		[datums]
	); //
	useEffect(() => setDatums([data.filter((d) => d.temp > -1000 && d.dwpt > -1000)]), [data]);
	const drawSounding = useCallback(
		(d3Sel) => {
			const temperature = (({ stroke, opacity, fill }) =>
				d3Sel ////
					.selectAll('temperature')
					.data(datums)
					.enter()
					.append('path')
					.attr('stroke-opacity', opacity)
					// .attr('stroke-width', 1.5)
					.attr('fill', fill)
					.attr('stroke', stroke)
					.attr('d', lineGen.temp)
					.attr('clip-path', 'url(#clipper)'))(palette.temperature);

			/**@isotherms //* Lines Of Equal Temperature */
			const dewpoint = (({ stroke, opacity, fill }) =>
				d3Sel
					.selectAll('dewpoint')
					.data(datums)
					.enter()
					.append('path')
					.attr('fill', fill)
					.attr('stroke', stroke)
					.attr('stroke-opacity', opacity)
					// .attr('stroke-width', 1.5)
					// .on('mouseout', ({ x, y }, dataset) => {
					// 	hover({
					// 		type: 'mouseout',
					// 		temp: scales.x.invert(x),
					// 		mbar: scales.y.invert(y),
					// 	});
					// })

					// .on('click', ({ x, y }, dataSet) => {
					// 	click({
					// 		temp: scales.x.invert(x),
					// 		mbar: scales.y.invert(y),
					// 	});
					// })
					.attr('d', lineGen.temp)
					.attr('d', lineGen.dewpt)
					.attr('clip-path', 'url(#clipper)'))(palette.dewpoint);

			return { soundingLines: { dewpoint, temperature } };
		},
		[datums, lineGen.dewpt, lineGen.temp, palette.temperature, palette.dewpoint]
	);
	useEffect(() => setState(({ ...oldState }) => ({ ...oldState, drawSounding })), [setState, drawSounding]);
	return <g strokeWidth='1.25' ref={ref} {...props} />;
}
