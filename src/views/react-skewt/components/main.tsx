import JSONTree from 'react-json-tree';
import { useD3 } from '../hooks/use-skewt';
export default function Main({ ...props }) {
	// ?
	const {
		ref,
		draw,
		state: {
			options: { palette },
			_loadState: { initialized },
			...state
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

	const style = {
		padding: '10px',
		backgroundColor: palette.background,
	};

	return (
		<div style={style}>
			state:
			<JSONTree hideRoot data={state} />
			draw:
			<JSONTree hideRoot data={draw} />
			<div ref={ref} style={{ backgroundColor: palette.foreground }} {...(initialized ? props : [null])} />;
		</div>
	);
}
