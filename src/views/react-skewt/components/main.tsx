import { useEffect, useReducer, useState } from 'react';
import Box from '@mui/material/Box';
import { useD3 } from '../hooks/use-skewt';
import make from './make';

const reducer = (oldState: any, newState: any) => ({ ...oldState, ...newState });
export default function Main({ ...props }) {
	/**@effect initRequired causes a useEffect reinitialization of the main dims*/
	const [require, dispatch] = useReducer(reducer, { init: true });
	const [hoverPosition, setHoverPosition] = useState({});
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

				const scales = make.scales(width, height, T, P);
				const axes = make.axes(scales, P);
				const lineGen = make.lines(scales, P);
				setState(({ mainDims, ...oldState }) => {
					return {
						...oldState,
						axes,
						lineGen,
						scales,
						mainDims: { ...mainDims, width, height },
						initialized: true,
						setHoverPosition,
					};
				});
			}
		},
		[require.init]
	);

	/**@effect  resize event listner is added, on resized, itRequired is reset*/
	useEffect(() => {
		// var timer: NodeJS.Timeout;

		//require, dispatch
		window.addEventListener('resize', (event) => {
			dispatch({ init: true });
			// if (timer) clearTimeout(timer);
			// setTimeout(() => dispatch({ init: true }), 250, event);
		});
	}, []);
	return (
		<>
			{JSON.stringify(hoverPosition)}
			<Box style={{ backgroundColor: palette.background }} sx={{ padding: 1 }}>
				<main ref={ref} style={{ backgroundColor: palette.foreground }} {...(initialized ? props : [null])} />
			</Box>
		</>
	);
}
