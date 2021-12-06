import { useD3 } from '../hooks/use-skewt';
export default function Clipper() {
	// const clipper = skewBackground.append('clipPath').attr('id', 'clipper').append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
	const {
		ref,
		state: {
			mainDims: { width, height },
		},
	} = useD3(null);
	return (
		<clipPath id='clipper' ref={ref}>
			<rect x='20px' y='0' width={width} height={height} />
		</clipPath>
	);
}
