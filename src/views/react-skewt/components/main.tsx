// import JSONTree from 'react-json-tree';
import { useD3 } from '../hooks/use-skewt';
import Box from '@mui/material/Box';
export default function Main({ ...props }) {
	// ?
	const {
		ref,
		// draw,
		state: {
			options: { palette },
			_loadState: { initialized },
			// ...state
		},
		initializeVariables,
		setState,
	} = useD3(
		'Main',
		(d3Ref) => {
			setState(
				(
					{ _loadState, ...oldState } //
				) => ({ ...oldState, _loadState: { ..._loadState, initialized: initializeVariables(d3Ref) } })
			);
		},
		[]
	);

	return (
		<Box
			style={{ backgroundColor: palette.background }}
			sx={{
				padding: 1,
				// margin: 10,
			}}>
			<Box
				ref={ref}
				style={{ backgroundColor: palette.foreground }}
				sx={{
					//
					padding: 1,
					// margin: 1,
				}}
				{...(initialized ? props : [null])}
			/>
		</Box>
	);
}
