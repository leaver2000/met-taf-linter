import { useRef, useEffect, useCallback, useState } from 'react';

import * as d3 from 'd3';
import { useCTX } from '../controller/ctx-controller';
import { useFetch } from '../hooks/use-fetch';

export default function TimeControl() {
	const {
		index: { level, baseUrl },
		dispatch,
	} = useCTX();

	const callBack = useCallback(
		(res: any, err: any) => {
			if (!!err) {
				throw new Error(err);
			} else {
				switch (level) {
					case 'sfc':
						const {
							dataset: { thermals },
						} = res;
						dispatch({ thermals });
						// console.log(thermals, res);
						break;
					default:
						break;
				}

				console.log(res);
			}
		},
		[dispatch, level]
	);
	const { getJSON } = useFetch(baseUrl, callBack);

	useEffect(() => getJSON('/temporal', { level }), [getJSON, level]);

	return <SVG />;
}

function SVG() {
	const [dims, setDims] = useState<TDIMS | null>(null);
	const [data, setDatums] = useState<TDATA | undefined>();
	const [{ lines, scales }, setLinesScales] = useState<LineScales>({ scales: undefined, lines: undefined });

	const {
		index: { thermals },
		dispatch,
	} = useCTX();

	const lineRef: React.MutableRefObject<any> = useRef();
	const mainRef: React.MutableRefObject<any> = useRef();

	const onEvent = useCallback(
		(d: MouseEvent) => {
			// const {}
			if (!!scales) {
				const { xScale } = scales; //yScale
				const time = Math.round(xScale.invert(d.pageX));
				// const temp = Math.round(yScale.invert(d.pageY));
				switch (d.type) {
					case 'click':
						dispatch({ time });
						break;
					case 'mouseover':
						break;
					case 'mousemove':
						break;
					case 'mouseout':
						break;

					default:
						break;
				}
			}
		},
		[scales, dispatch]
	);
	//render callback
	const plotLines = useCallback(
		(svg, { temp, dwpt }, { height, width }) => {
			svg //
				.append('path')
				.attr('d', temp)
				.attr('fill', 'none')
				.attr('stroke', 'red');

			svg //
				.append('path')
				.attr('d', dwpt)
				.attr('fill', 'none')
				.attr('stroke', 'green');

			svg //
				.append('rect')
				.style('fill', 'none')
				.style('pointer-events', 'all')
				.attr('width', width)
				.attr('height', height)
				.on('click', onEvent)
				.on('mouseover', onEvent)
				.on('mousemove', onEvent)
				.on('mouseout', onEvent);
		},
		[onEvent]
	);
	//render callback
	const plotAxes = useCallback((svg, { xScale }, { height }) => {
		var x_axis = d3.axisBottom(xScale).ticks(20);
		var xAxisTranslate = height / 2 + 30;
		svg
			.append('g')
			.attr('transform', 'translate(0, ' + xAxisTranslate + ')')
			.call(x_axis);
	}, []);

	const initDims = useCallback((ref) => {
		const main = d3.select(ref);
		let width = parseInt(main.style('width'));
		let height = parseInt(main.style('height'));
		setDims({ width, height });
	}, []);
	// FIRST ORDER EFFECT =>
	useEffect(() => {
		if (!!mainRef.current) {
			initDims(mainRef.current);
			window.addEventListener('resize', () => initDims(mainRef.current));
		}
	}, [initDims]);

	// SECOND ORDER EFFECT => setDatums
	useEffect(() => {
		if (!!thermals) {
			const tmpData: number[] = thermals['2_m_agl_tmp'];
			const dptData: number[] = thermals['2_m_agl_dpt'];
			setDatums({
				domain: {
					Y: getDomain([...tmpData, ...dptData]),
					X: [0, tmpData.length],
				},
				datums: tmpData.map((d, i) => [d, dptData[i]]),
			});
		}
	}, [thermals]);

	// THIRD ORDER EFFECT => setLinesScales
	useEffect(() => {
		if (!!dims && !!data) {
			const scales = makeScales(data, dims);
			const lines = makeLineGenerators(scales, data);
			setLinesScales({ scales, lines });
		}
	}, [dims, data]);

	// FOURTH ORDER EFFECT => plot
	useEffect(() => {
		const currentRefs = !!lineRef.current;
		if (!!scales && !!lines && currentRefs && !!dims) {
			const ref = d3.select(lineRef.current);

			ref.selectAll('*').remove();
			plotLines(ref, lines, dims);
			plotAxes(ref, scales, dims);
		}
	}, [scales, lines, plotLines, dims, plotAxes]);

	return (
		<div ref={mainRef} style={{ margin: 5, border: 'solid black', background: 'white', height: 90 }}>
			{!!dims ? <svg ref={lineRef} width={dims.width} height={dims.height} /> : null}
		</div>
	);
}
function getDomain(data: number[]) {
	const max = d3.max(data);
	const min = d3.min(data);
	if (!!max && !!min) {
		let res: [number, number] = [min, max];
		return res;
	} else {
		throw new Error();
	}
}
function makeLineGenerators({ xScale, yScale }, { datums }) {
	var tempGenerator = d3
		.line()
		.x((_, i) => xScale(i))
		.y(([temp, dwpt]) => yScale(temp));

	var dwptGenerator = d3
		.line()
		.x((_, i) => xScale(i))
		.y(([temp, dwpt]) => yScale(dwpt));

	return { temp: tempGenerator(datums), dwpt: dwptGenerator(datums) };
}

function makeScales({ domain: { X, Y } }, { height, width }) {
	const xScale = d3
		.scaleLinear()
		.domain(X)
		.range([0, width - 20]);

	const yScale = d3 //
		.scaleLinear()
		.domain(Y)
		.range([height + 20, 0]);
	return { yScale, xScale };
}
// TYPES
type LineScales = {
	scales: { yScale: d3.ScaleLinear<number, number, never>; xScale: d3.ScaleLinear<number, number, never> } | undefined;
	lines:
		| {
				temp: string | null;
				dwpt: string | null;
		  }
		| undefined;
};
type TDATA = {
	datums: [number, number][];
	domain: { X: [number, number]; Y: [number, number] };
};
type TDIMS = { width: number; height: number };
