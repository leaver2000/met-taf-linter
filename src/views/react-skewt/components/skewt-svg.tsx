import { useMemo } from 'react';
import { useD3 } from '../hooks/use-skewt';

export default function SkewTSVG({ ...props }) {
	const {
		ref,
		state: { mainDims },
	} = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

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

	return (
		<svg ref={ref} width={width} height={height}>
			<g transform={`translate(${left}, ${top})`} {...props} />
		</svg>
	);
}
