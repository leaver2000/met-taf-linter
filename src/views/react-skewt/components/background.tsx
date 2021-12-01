import { useEffect } from 'react';
// import * as d3 from 'd3';
// import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators';
import { useD3 } from '../hooks/use-skewt';
// import { useDraw } from '../hooks/use-draw';

export default function Background({ ...props }) {
	//P = pressure | T =temperature
	const { ref, state, draw } = useD3('skewBackground', (bgRef) => draw.background(bgRef), []);
	// const draw = useDraw(state);
	useEffect(() => {
		if (!!state.parameters) {
		}
	}, [state.parameters]);

	return <g className='skew-background' color='blue' ref={ref} {...props} />;
}
