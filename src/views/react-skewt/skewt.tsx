// import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
// import { DEG2RAD, getElevation, pressureFromElevation } from './util/atmosphere';
import SkewController, { useD3, useController } from './hooks/use-skewt';
import SkewBackground from './components/background';
import Main from './components/main';
import JSONTree from 'react-json-tree';
import { sounding } from './data/sounding';
//color palettes
const cp = {
	light: {
		stroke: {
			primary: 'rgb(249,38,114)',
			primaryAlt: 'rgb(150, 150, 150)',
			secondary: 'rgb(102,217,239)',
			secondaryAtl: 'rgb(253,151,31)',
			accent: 'rgb(174,129,255)',
		},
		fill: {
			background: 'white',
			foreground: 'grey',
		},
	},
	dark: {
		stroke: {
			primary: 'rgb(249,38,114)',
			primaryAlt: 'rgb(166,226,46)',
			secondary: 'rgb(102,217,239)',
			secondaryAtl: 'rgb(253,151,31)',
			accent: 'rgb(174,129,255)',
		},
		fill: {
			background: 'white',
			foreground: 'grey',
		},
	},
	monokai: {
		stroke: {
			primary: '#F92672', //red
			primaryAlt: '#FD971F', //orange
			secondary: ' #66D9EF', //blue
			secondaryAtl: '#A6E22E', //lime
			accent: '#AE81FF', //purple
		},
		fill: {
			background: '#F272822', //dark grey
			foreground: '#75715e', //light grey
		},
	},
};

export default function SkewtLab() {
	const [styles, setAttributes] = useState(cp.light);
	const onEvent = useMemo(
		() => ({
			click: () => {},
			focus: () => {},
			hover: () => {},
		}),
		[]
	);
	return (
		<>
			<button onClick={() => setAttributes(cp.light)}>light</button>
			<button onClick={() => setAttributes(cp.dark)}>dark</button>
			<button onClick={() => setAttributes(cp.monokai)}>monokai</button>
			<SkewController>
				<SkewMain data={sounding} options={{ onEvent, gradient: 45, ...styles }} />
			</SkewController>
		</>
	);
}

function SkewMain({ data, options }) {
	const { state, setState } = useController();
	useEffect(() => setState(({ ...oldState }) => ({ ...oldState, options, data })), [setState, data, options]);
	// useEffect(() => setState(({ ...oldState }) => ({ ...oldState, data })), [setState, data]);

	useEffect(() => {
		console.log(state.data, state.options);
	}, [state.data, state.options]);

	return (
		<>
			{JSON.stringify(state.options)}
			<JSONTree hideRoot data={state._styles} />
			<JSONTree hideRoot data={state} />
			{!!state.options && state.data ? (
				<Main data={data}>
					<SVGSVGSkewt>
						<SkewContainer data={data}>
							<SkewBackground>{/* <Clipper /> */}</SkewBackground>
							<SkewWindbarbs data={data} />
						</SkewContainer>
					</SVGSVGSkewt>
					<SkewClouds data={data} />
				</Main>
			) : null}
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
		state: {
			options: { fill },
			_styles,
		},
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

	return (
		<svg //
			ref={ref}
			width={width}
			height={height}
			className='skew-svg'
			style={{ backgroundColor: fill.foreground }}
			{...props}
		/>
	);
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
