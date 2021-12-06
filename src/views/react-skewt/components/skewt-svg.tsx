import { useCallback, useState } from 'react';
import { useMemo } from 'react';
import { useD3 } from '../hooks/use-skewt';

export default function SkewTSVG({ ...props }) {
	const {
		ref,
		state: { mainDims, scales },
	} = useD3(null);

	const [width, height, top, left] = useMemo(() => {
		const {
			margin: { top, right, left, bottom },
			width,
			height,
		} = mainDims;
		const w = width + right + left;
		const h = height + top + bottom;
		return [w, h, top, left];
	}, [mainDims]);

	const [hover, setHover] = useState<{ temp: null | number; press: null | number }>({ temp: null, press: null });
	const onEvent = useCallback(
		(e) => {
			const { x, y, tan } = scales;
			const temp = Math.round(x.invert(e.pageX) / tan);
			const press = Math.round(y.invert(e.pageY));
			// console.log(temp, press, e.type);
			switch (e.type) {
				case 'click':
					// dispatch({ time });
					break;
				case 'mouseover':
					setHover({ temp, press });
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
		[scales]
	);

	return (
		<>
			{JSON.stringify(hover)}
			<svg ref={ref} width={width} height={height}>
				<g onMouseOver={onEvent} transform={`translate(${left}, ${top})`} {...props} />
			</svg>
		</>
	);
}
