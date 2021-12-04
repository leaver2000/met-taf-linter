import { useRef, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import * as d3 from 'd3';
export default function TimeControl() {
	return (
		<Box sx={{ backgroundColor: 'red', height: 90, margin: 1, width: '100%' }}>
			<Box sx={{ margin: 1, backgroundColor: 'green' }}>
				<Box sx={{ height: 2, margin: 1, backgroundColor: 'blue' }} />
			</Box>
			<Box sx={{ height: 60, margin: 1, backgroundColor: 'green' }}>
				<SVG />
			</Box>
		</Box>
	);
}
function SVG() {
	// const [dims, setDims] = useState<{ width: string; height: string } | null>(null);
	// const [data, setData] = useState<any | null>(null);

	const svgRef: React.MutableRefObject<any> = useRef();
	const svgGRef: React.MutableRefObject<any> = useRef();

	useEffect(() => {
		// const svg = d3.select(svgRef.current);
		return () => {};
		// const width = svg.style('width');
		// const height = svg.style('height');
		// setDims({ height, width });
	}, []);
	useEffect(() => {
		// const d = d3.csv(dataSet);
		// setData(d);
	}, []);
	const margin = useMemo(() => ({ top: 10, right: 30, bottom: 30, left: 60 }), []);
	useEffect(() => {
		d3.select(svgGRef.current).attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}, [margin]);
	// console.log(data);
	// const margin = useMemo(() => {
	// 	if (!!dims) {
	// 		const { width, height } = dims;

	// 	}
	// 	// var margin = {top: 10, right: 30, bottom: 30, left: 60},
	// 	// width = 460 - margin.left - margin.right,
	// 	// height = 400 - margin.top - margin.bottom;
	// 	return;
	// }, [dims, margin]);

	return (
		<svg ref={svgRef}>
			<g ref={svgGRef}></g>
		</svg>
	);
}
// const dataSet = [];
