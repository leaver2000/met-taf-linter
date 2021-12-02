import { useEffect } from 'react';
import { useD3 } from '../hooks/use-skewt';

export default function Diagram({ ...props }) {
	//P = pressure | T =temperature
	const { ref, state, draw } = useD3(
		'diagram',
		(d3Ref) => {
			draw.all('background', d3Ref);
			// draw.all('background', bgRef);
		},
		[]
	);
	// const draw = useDraw(state);
	useEffect(() => {
		if (!!state.parameters) {
		}
	}, [state.parameters]);
	// console.log(draw);

	return <g className='layer-one' ref={ref} {...props} />;
}
