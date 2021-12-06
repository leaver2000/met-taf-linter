import { useEffect, useReducer } from 'react';
import Box from '@mui/material/Box';
import { useD3, makeScales, makeAxes } from '../hooks/use-skewt';
import LineGenerators from '../hooks/line-generators';

const reducer = (oldState: any, newState: any) => ({ ...oldState, ...newState });
export default function Main({ ...props }) {
	/**@effect initRequired causes a useEffect reinitialization of the main dims*/
	const [require, dispatch] = useReducer(reducer, { init: true });

	const {
		ref,
		state: {
			P,
			T,
			options: { palette },
			mainDims: { margin },
			initialized,
		},
		setState,
	} = useD3(
		'Main',
		(d3Ref) => {
			/**@statement if initRequired */
			if (require.init) {
				dispatch({ init: false });
				// initialize dims /scales/ axes
				let width = parseInt(d3Ref.style('width'), 10) - 10;
				let height = width; //to fix
				width = width - margin.left - margin.right;
				height = width - margin.top - margin.bottom;

				setState(({ mainDims, ...oldState }) => {
					const scales = makeScales(width, height, T, P);
					const lineGen = new LineGenerators(scales, P).makeAllLineGenerators();
					const axes = makeAxes(scales, P);
					return {
						...oldState,
						axes,
						lineGen,
						scales,
						mainDims: { ...mainDims, width, height },
						initialized: true,
					};
				});
			}
		},
		[require.init]
	);

	/**@effect  resize event listner is added, on resized, itRequired is reset*/
	useEffect(() => {
		var timer: NodeJS.Timeout;

		//require, dispatch
		window.addEventListener('resize', (event) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => dispatch({ init: true }), 250, event);
		});
	}, []);
	return (
		<Box style={{ backgroundColor: palette.background }} sx={{ padding: 1 }}>
			<main ref={ref} style={{ backgroundColor: palette.foreground }} {...(initialized ? props : [null])} />
		</Box>
	);
}
