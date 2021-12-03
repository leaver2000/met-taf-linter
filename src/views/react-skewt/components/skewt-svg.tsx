import { useMemo } from 'react';
import { useD3 } from '../hooks/use-skewt';

export default function SkewTSVG({ ...props }) {
	const {
		ref,
		state: { mainDims },
	} = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

	const [width, height] = useMemo(() => {
		const {
			margin: { top, right, left, bottom },
			width,
			height,
		} = mainDims;
		const w = width + right + left;
		const h = height + top + bottom;
		return [w, h];
	}, [mainDims]);

	return <svg ref={ref} width={width} height={height} className='skew-svg' {...props} />;
}
