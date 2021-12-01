import { useCallback, useEffect } from 'react';
import { useD3 } from '../hooks/use-skewt';
export default function SkewMain({ data, gradient = 45, ...props }) {
	// ?
	const {
		ref,
		state: {
			options: { fill },
			_loadState: { initialized, loaded, sized },
		},
		initializeVariables,
		resize,
		setState,
	} = useD3(
		'divMain',
		(divMain) =>
			setState(
				(
					{ _loadState, ...oldState } //
				) => ({ ...oldState, _loadState: { ..._loadState, initialized: initializeVariables(divMain) } })
			),
		[data.length]
	);

	// const backgroundColor = fill.background;
	const shiftXAxis = useCallback(() => {
		// clipper.attr("x", -xOffset);
		// xAxisValues.attr("transform", `translate(${xOffset}, ${h-0.5} )`);
		// for (let p in lines) {
		//     lines[p].attr("transform",`translate(${xOffset},0)`);
		// };
		// dataAr.forEach(d=>{
		//     for (let p in d.lines){
		//         d.lines[p].attr("transform",`translate(${xOffset},0)`);
		//     }
		// })
		//  setCount(7)
	}, []);
	useEffect(() => {
		// * once all the elements are loaded, the resize function adjust the skewt to fit the window,
		if (loaded && !sized) {
			// const sized = resize();
			// setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, sized } }));
		}
		return () => {
			shiftXAxis();
		};
	}, [setState, loaded, resize, sized, shiftXAxis]);
	const styles = {
		padding: '10px',
		backgroundColor: fill.background,
	};
	return (
		<div style={styles}>
			<div ref={ref} className='skew-t' {...(initialized ? props : [null])} />;
		</div>
	);
}
