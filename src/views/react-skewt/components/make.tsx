import { scaleLinear, scaleLog, axisBottom, format, axisLeft, axisRight } from 'd3';
import { DEG2RAD } from '../util/math';
import { pressureFromElevation } from '../util/atmo2';
import type * as CTX from '../types';
import LineGenerators from './generator';
export const pAt11km = pressureFromElevation(11000);

const tan = Math.tan(45 * DEG2RAD);
const scales = (width: number, height: number, { mid, range }: CTX._T, { top, base }: CTX._P) => ({
	x: scaleLinear()
		.range([-width / 2, width + width / 2])
		.domain([mid - range * 2, mid + range * 2]),
	//
	y: scaleLog().range([0, height]).domain([top, base]),
	tan,
});

const axes = ({ x, y }: CTX.Scales, { log, mbarTicks, altTicks }) => {
	//
	const x0 = axisBottom(x).tickSize(0).ticks(40); //.orient("bottom");
	//
	const y0 = axisLeft(y)
		.tickSize(0)
		.tickValues(log.filter((p: number) => p % 100 === 0 || p === 50 || p === 150))
		.tickFormat(format('.0d')); //.orient("left");
	//
	const y1 = axisRight(y).tickSize(5).tickValues(mbarTicks); //.orient("right");
	// d3.axisLeft(y).tickSize(2,0).tickValues(altticks);
	const y2 = axisLeft(y).tickSize(2).tickValues(altTicks);

	return { x0, y0, y1, y2 };
};
const lines = (scales: CTX.Scales, P: CTX._P) => new LineGenerators(scales, P).makeAllLineGenerators();

const make = { scales, axes, lines };
export default make;
