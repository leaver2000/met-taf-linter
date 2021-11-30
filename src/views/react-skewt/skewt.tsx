// import * as d3 from 'd3';
import { useCallback, useMemo } from 'react';
// import { DEG2RAD, getElevation, pressureFromElevation } from './util/atmosphere';
import SkewController, { useD3, useController } from './hooks/use-skewt';
import SkewBackground from './components/background';
import Main from './components/main';
import JSONTree from 'react-json-tree';
export default function SkewtLab({ data, options }: { data: { [key: string]: number }[]; options: any }) {
	return (
		<SkewController data={data} options={options}>
			<SkewMain />
		</SkewController>
	);
}

function SkewMain() {
	const {
		state: { data, ...state },
	} = useController();
	return (
		<>
			{/* <JSONTree hideRoot data={document} /> */}
			<JSONTree hideRoot data={state._styles} />
			<JSONTree hideRoot data={state} />
			<Main data={data}>
				<SVGSVGSkewt>
					<SkewContainer data={data}>
						<SkewBackground>
							<Clipper />
							{/* <Isobars />
                            <Isotherms /> */}
						</SkewBackground>
						<SkewWindbarbs data={data} />
					</SkewContainer>
				</SVGSVGSkewt>
				<SkewClouds data={data} />
			</Main>
		</>
	);
}
function Clipper() {
	// const clipper = skewBackground.append('clipPath').attr('id', 'clipper').append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
	const {
		ref,
		state: {
			_styles: { width, height },
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
		state: { _styles },
	} = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

	const [width, height] = useMemo(() => {
		const {
			margin: { top, right, left, bottom },
			width,
			height,
		} = _styles;
		const w = width + right + left;
		const h = height + top + bottom;
		return [w, h];
	}, [_styles]);

	return <svg ref={ref} width={width} height={height} className='skew-svg' {...props} />;
}

function SkewWindbarbs({ data }) {
	const { ref } = useD3(
		'skewWindbarbs',
		(skewWindbarbs) => {
			// return { _refs: { skewWindbarbs } };
		},
		[data.length]
	);

	return <g ref={ref} />;
}

function SkewContainer({ data, ...props }) {
	const handleD3 = useCallback((skewContainer) => {}, []);
	const { ref } = useD3('skewContainer', handleD3, []);

	return <g ref={ref} className='skew-container' {...props} />;
}

function SkewClouds({ data, ...props }) {
	// console.log(state);
	return (
		<div className='cloud-container'>
			<CloudCanvas />
			<CloudCanvas />
		</div>
	);
}
function CloudCanvas() {
	return <canvas className='cloud' style={{ width: 1, height: 200 }} />;
}
