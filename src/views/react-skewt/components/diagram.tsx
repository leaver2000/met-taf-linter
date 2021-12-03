import { useD3 } from '../hooks/use-skewt';
/**
 *### JSX-D3 `Component`
 * renders the `log-p` `skew-t` background Diagram
 */
export function Diagram({ ...props }) {
	const { ref } = useD3('Diagram', () => ({}), []); //
	return <g ref={ref} clipPath='url(#clipper)' fillOpacity='.5' strokeWidth='.8' {...props} />;
}
/**
 *### JSX-D3 `Component`
 * renders the the Axes ticks on the left and bottom of the background Diagram
 */
export function AxesTicks({ ...props }) {
	const { ref } = useD3('Ticks', () => ({}), []); //
	return <g fillOpacity='1' strokeWidth='1' ref={ref} {...props} />;
}
/**
 *### JSX-D3 `Component`
 * renders the Environmental Sounding
 */
export function Sounding({ ...props }) {
	const { ref } = useD3('Sounding', () => ({}), []); //
	return <g strokeWidth='2' ref={ref} {...props} />;
}
