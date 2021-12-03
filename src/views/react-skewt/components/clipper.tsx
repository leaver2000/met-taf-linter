import { useD3 } from '../hooks/use-skewt';
export default function Clipper() {
	// const clipper = skewBackground.append('clipPath').attr('id', 'clipper').append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
	const {
		ref,
		state: {
			mainDims: { width, height },
		},
	} = useD3('clipper', (clipper) => ({}), []);
	return (
		<clipPath ref={ref} className='clipper' id='clipper'>
			<rect width={width} height={height}></rect>
		</clipPath>
	);
}
