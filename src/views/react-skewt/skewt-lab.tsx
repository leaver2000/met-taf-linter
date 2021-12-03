import { useMemo } from 'react';
import { useD3 } from './hooks/use-skewt';
import { Diagram, Sounding } from './components/diagram';
import Main from './components/main';
import { Command, Control } from './controller/c2';
// import JSONTree from 'react-json-tree';
function Components() {
	return (
		<Main>
			<SVGSVGSkewt>
				<Diagram />
				<Sounding />
				<Clipper />
			</SVGSVGSkewt>
		</Main>
	);
}

const SkewtLab = ({ data, options }: SkewTProps) => (
	<Command>
		<Control data={data} options={options}>
			<Components />
		</Control>
	</Command>
);

export default SkewtLab;

function Clipper() {
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

function SVGSVGSkewt({ ...props }) {
	const {
		ref,
		state: { mainDims },
	} = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

	const [width, height] = useMemo(() => {
		const {
			margin: { top, right, left, bottom },
			width,
			height,
		} = mainDims;
		const w = width + right + left;
		const h = height + top + bottom;
		return [w, h];
	}, [mainDims]);

	return <svg ref={ref} fill='green' width={width} height={height} className='skew-svg' {...props} />;
}
