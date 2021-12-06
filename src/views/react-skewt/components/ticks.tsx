import { useD3 } from '../hooks/use-skewt';
import { useCallback, useEffect } from 'react';
/**
 *### JSX-D3 `Component`
 * renders the the Axes ticks on the left and bottom of the background Diagram
 */
export function Ticks({ ...props }) {
	const {
		ref,
		state: {
			mainDims: { height },
			axes,
		},
		setState,
	} = useD3('Ticks', (d3Sel: any) => drawTicks(d3Sel), []); //

	const drawTicks = useCallback(
		(d3Sel) => {
			const { x0, y0, y1, y2 } = axes;
			// console.log(axes);
			d3Sel
				.append('g')
				// .attr('class', 'x axis')
				.attr('transform', 'translate(0,' + (height - 0.5) + ')')
				.call(x0);
			// .attr('clip-path', 'url(#clipper)');
			d3Sel
				.append('g')
				// .attr('class', 'y axis')
				.attr('transform', 'translate(-0.5,0)')
				.call(y0);
			// .on('mouseover', (e) => console.log(e));
			d3Sel.append('g').attr('class', 'y axis ticks').attr('transform', 'translate(-0.5,0)').call(y1);
			d3Sel.append('g').attr('class', 'y axis hght-ticks').attr('transform', 'translate(-0.5,0)').call(y2);
		},
		[height, axes]
	);

	useEffect(() => setState(({ ...oldState }) => ({ ...oldState, drawTicks })), [setState, drawTicks]);

	return <g fillOpacity='1' strokeWidth='1' ref={ref} {...props} />;
}
