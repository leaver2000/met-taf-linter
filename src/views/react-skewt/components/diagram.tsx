import { useD3 } from '../hooks/use-skewt';
export function Diagram({ ...props }) {
	const {
		ref,
		state: {
			options: { palette },
		},
		draw,
	} = useD3('Diagram', (d3Ref) => draw.background(d3Ref), []); //

	return <g fill={palette.foreground} ref={ref} {...props} />;
}

export function Sounding({ ...props }) {
	const {
		ref,
		state: {
			options: { palette },
		},
		draw,
	} = useD3('Sounding', (d3Ref) => draw.sounding(d3Ref), []); //

	return <g fill={palette.foreground} ref={ref} {...props} />;
}
