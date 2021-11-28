import { useCallback, useEffect } from 'react';
import { SVGGElement } from './elements';
import * as d3 from 'd3';
import { DEG2RAD, getElevation, getElevation2 } from '../util/atmosphere';
import { useD3 } from '../hooks/use-skewt';
export default function Background({
	data,
	state: {
		_isoTherms,
		_isoBars,
		_styles: { height },
		_scales,
	},
	setState,
}) {
	const resize = useCallback(() => {}, []);
	const withD3 = useCallback(
		(backGround) => {
			backGround
				.selectAll('templine')
				.data(
					d3
						.scaleLinear()
						.domain([_isoTherms.mid - _isoTherms.range * 3, _isoTherms.mid + _isoTherms.range])
						.ticks(24)
				)
				.enter()
				.append('line')
				.attr('x1', (d) => _scales.x(d) - 0.5 + (_scales.y(_isoBars.base) - _scales.y(_isoBars.top)) / _scales.tangent)
				.attr('x2', (d) => _scales.x(d) - 0.5)
				.attr('y1', 0)
				.attr('y2', height)
				.attr('class', (d) => (d === 0 ? `tempzero ${_isoBars.highlight ? 'highlight-line' : ''}` : `templine ${_isoBars.hightlight ? 'highlight-line' : ''}`))
				.attr('clip-path', 'url(#clipper)');

			var elrFx = d3
				.line()
				.curve(d3.curveLinear)
				.x((d, i) => {
					let e = getElevation2(d);
					let t = Number(d) > _isoBars.pAt11km ? 15 - getElevation(d) * 0.00649 : -56.5; //6.49 deg per 1000 m
					return _scales.x(t) + (_scales.y(_isoBars.base) - _scales.y(d)) / _scales.tangent;
				})
				.y((d, i) => _scales.y(d));
			//?Environmental Lapse Rate (ELR)
			const elr = backGround
				.selectAll('elr')
				.data([_isoBars.lines.filter((p: number) => p > _isoBars.pAt11km).concat([_isoBars.pAt11km, 50])])
				.enter()
				.append('path')
				.attr('d', elrFx)
				.attr('clip-path', 'url(#clipper)')
				.attr('class', `elr ${true ? 'highlight-line' : ''}`);

			setState(({ _refs, ...oldState }) => ({ ...oldState, _refs: { backGround, ..._refs } }));
		},

		[_isoTherms, _isoBars, height, _scales]
	);
	const ref = useD3(withD3, [data.length]);
	// useEffect(()=>{
	// 	ref.selectAll('*').remove()
	// },[])
	// return <g ref={ref} {...props} />;

	return <SVGGElement className='windbarb' withD3={withD3} data={data} />;
}

// function Clip(){
// 	return <clipPath />
// }
