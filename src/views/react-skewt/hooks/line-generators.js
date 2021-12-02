import * as d3 from 'd3';
import * as atm from '../components/atmosphere';
export const pAt11km = atm.pressureFromElevation(11000);

const K0 = 273.15;

export function elrLineGenerator({ x, y, tan }, { base }) {
	return d3
		.line()
		.curve(d3.curveLinear)
		.x(function (d, i) {
			// let e = atm.getElevation2(d);
			let t = d > pAt11km ? 15 - atm.getElevation(d) * 0.00649 : -56.5; //6.49 deg per 1000 m
			return x(t) + (y(base) - y(d)) / tan;
		})
		.y(function (d, i) {
			return y(d);
		});
}

export function dalrLineGenerator({ x, y, tan }, { base, log }) {
	return d3
		.line()
		.curve(d3.curveLinear)
		.x(function (d, i) {
			return x(atm.dryLapse(log[i], K0 + d, base) - K0) + (y(base) - y(log[i])) / tan;
		})
		.y(function (d, i) {
			return y(log[i]);
		});
}

export function malrLineGenerator({ x, y, tan }, { log, base, increment }, moving) {
	let temp;
	return d3
		.line()
		.curve(d3.curveLinear)
		.x(function (d, i) {
			// console.log(increment);

			temp = i === 0 ? K0 + d : temp + atm.moistGradientT(log[i], temp) * increment; //(false ? (top - base) / 4 : increment);
			// console.log(x(temp - K0) + (y(base) - y(log[i])) / tan);
			// console.log(K0 + d);
			return x(temp - K0) + (y(base) - y(log[i])) / tan;
		})
		.y(function (d, i) {
			return y(log[i]);
		});
}

// .curve(d3.curveLinear)
// .x(function(d,i) {
//     temp= i==0? K0 + d : ((temp + atm.moistGradientT(pp[i], temp) * (moving?(topp-basep)/4:pIncrement)) )
//     return x(temp - K0) + (y(basep)-y(pp[i]))/tan;
// })
// .y(function(d,i) { return y(pp[i])} );

export function isohumeLineGenerator({ x, y, tan }, { log, base }) {
	var mixingRatio;
	var temp;
	return d3
		.line()
		.curve(d3.curveLinear)
		.x(function (d, i) {
			//console.log(d);
			if (i === 0) mixingRatio = atm.mixingRatio(atm.saturationVaporPressure(d + K0), log[i]);
			temp = atm.dewpoint(atm.vaporPressure(log[i], mixingRatio));
			return x(temp - K0) + (y(base) - y(log[i])) / tan;
		})
		.y(function (d, i) {
			return y(log[i]);
		});
}
