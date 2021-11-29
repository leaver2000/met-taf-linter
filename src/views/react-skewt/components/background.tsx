// import { useCallback, useEffect } from 'react';
// import { SVGGElement } from './elements';
import * as d3 from 'd3';
// import { getElevation } from '../util/atmosphere'; //DEG2RAD//getElevation2
import { useD3 } from '../hooks/use-skewt';

export default function Background({ data, ...props }) {
	const {
		ref,
		state: {
			_isoTherms,
			_isoBars,
			_styles: { height },
			_scales: { x, y, tangent },
			// _scales,
			// _refs,
		},
		// setState,
	} = useD3(
		'skewBackground',
		(skewBackground) => {
			const domain = [_isoTherms.mid - _isoTherms.range * 3, _isoTherms.mid + _isoTherms.range];
			const linearScale = d3.scaleLinear().domain(domain).ticks(24);
			skewBackground
				.selectAll('templine')
				.data(linearScale)
				.enter()
				.append('line')
				.attr('x1', (d: number) => x(d) - 0.5 + (y(_isoBars.base) - y(_isoBars.top)) / tangent)
				.attr('x2', (d: number) => x(d) - 0.5)
				.attr('y1', 0)
				.attr('y2', height)
				.attr('class', (d: number) => (d === 0 ? `tempzero ${!_isoBars.highlight ? 'highlight-line' : ''}` : `templine ${!_isoBars.highlight ? 'highlight-line' : ''}`));
			//     .attr('clip-path', 'url(#clipper)');

			// var elrFx = d3
			//     .line()
			//     .curve(d3.curveLinear)
			//     .x((d, i) => {
			//         // let e = getElevation2(d);
			//         let t = Number(d) > _isoBars.pAt11km ? 15 - getElevation(d) * 0.00649 : -56.5; //6.49 deg per 1000 m
			//         return _scales.x(t) + (_scales.y(_isoBars.base) - _scales.y(d)) / _scales.tangent;
			//     })
			//     .y((d, i) => _scales.y(d));
			//?Environmental Lapse Rate (ELR)
			// skewBackground
			//     .selectAll('elr')
			//     .data([_isoBars.lines.filter((p: number) => p > _isoBars.pAt11km).concat([_isoBars.pAt11km, 50])])
			//     .enter()
			//     .append('path')
			//     .attr('d', elrFx)
			//     .attr('clip-path', 'url(#clipper)')
			//     .attr('class', `elr ${true ? 'highlight-line' : ''}`);

			return { _refs: { skewBackground } };
		},
		[data.length]
	);
	console.log(props);
	return <g className='skew-background' ref={ref} {...props} />;
}
export function Isohume() {
	const {
		ref,
		state: {
			_isoBars,
			_styles: {
				// height,
				width,
				//  margin
			},
			_scales: { y },
			// _isoTherms,
			// _scales,
			// _refs,
		},
	} = useD3(
		'lineIsohum',
		(lineIsohum) => {
			lineIsohum
				.selectAll('lineIsobar')
				.data(_isoBars.lines)
				// .enter().append("line")
				.attr('x1', -width)
				.attr('x2', 2 * width)
				.attr('y1', y)
				.attr('y2', y)
				.attr('clip-path', 'url(#clipper)')
				.attr('class', `pressure ${_isoBars.highlight ? 'highlight-line' : ''}`);
			// return { _refs: { lineIsobar } }
		},
		[]
	);
	return <line ref={ref} />;
}
export function Isobars() {
	const {
		ref,
		state: {
			_isoBars: { lines },
			_styles: {
				width,
				// height,
				//   margin
			},
			_scales: { y },
			// _isoTherms,
			// _scales,
			// _refs,
		},
		// setState,
	} = useD3(
		'lineIsobar',
		(lineIsobar) => {
			lineIsobar
				.selectAll('pressureline')
				.data(lines)
				.enter()
				.append('line')
				.attr('x1', -width)
				.attr('x2', 2 * width)
				.attr('y1', y)
				.attr('y2', y)
				.attr('clip-path', 'url(#clipper)');
			// .attr('class', `pressure ${buttons['Pressure'].hi ? 'highlight-line' : ''}`);

			return { _refs: { lineIsobar } };
		},
		[]
	);
	return <line ref={ref} />;
}

export function Isotherms() {
	const {
		ref,
		state: {
			// _isoTherms,
			_isoBars,
			_styles: { width },
			_scales: { y },
			// _scales,
			// _refs,
		},
		// draw,
		// setState,
	} = useD3(
		'lineIsotherm',
		(lineIsotherm) => {
			lineIsotherm
				.selectAll('lineIsotherm')
				.data(_isoBars.lines)
				// .enter().append("line")
				.attr('x1', -width)
				.attr('x2', 2 * width)
				.attr('y1', y)
				.attr('y2', y)
				.attr('clip-path', 'url(#clipper)')
				.attr('class', `pressure ${_isoBars.highlight ? 'highlight-line' : ''}`);
			return { _refs: { lineIsotherm } };
		},
		[]
	);
	return <line ref={ref} />;
}

export {};
