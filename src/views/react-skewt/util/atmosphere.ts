export const pressureFromElevation = (e: number, refp = 1013.25) => Math.pow(-((e * 3.28084) / 145366.45 - 1), 1 / 0.190284) * refp;
const Rd = 287;
// Specific heat at constant pressure for dry air
const Cpd = 1005;
// Molecular weight ratio
const epsilon = 18.01528 / 28.9644;
// Heat of vaporization of water
const Lv = 2501000;
// Ratio of the specific gas constant of dry air to the specific gas constant for water vapour
const satPressure0c = 6.112;
// C + celsiusToK -> K
// const celsiusToK = 273.15;
const L = -6.5e-3;
const g = 9.80665;
export const DEG2RAD = Math.PI / 180;
export const K0 = 273.15;
export function getElevation(p: any, p0 = 1013.25) {
	const t0 = 288.15;
	//const p0 = 1013.25;
	return (t0 / L) * (Math.pow(p / p0, (-L * Rd) / g) - 1);
}
//pressure altitude with NOAA formula  (https://en.wikipedia.org/wiki/Pressure_altitude)
export const getElevation2 = (p: any, refp = 1013.25) => (145366.45 * (1 - Math.pow(p / refp, 0.190284))) / 3.28084;
export function dryLapse(p, tK0, p0) {
	return tK0 * Math.pow(p / p0, Rd / Cpd);
}
export function mixingRatio(partialPressure, totalPressure, molecularWeightRatio = epsilon) {
	return (molecularWeightRatio * partialPressure) / (totalPressure - partialPressure);
}

// Computes the saturation mixing ratio of water vapor.
function saturationMixingRatio(p, tK) {
	return mixingRatio(saturationVaporPressure(tK), p);
}

// Computes the saturation water vapor (partial) pressure
export function saturationVaporPressure(tK) {
	const tC = tK - K0;
	return satPressure0c * Math.exp((17.67 * tC) / (tC + 243.5));
}

// Computes the temperature gradient assuming liquid saturation process.
export function moistGradientT(p, tK) {
	const rs = saturationMixingRatio(p, tK);
	const n = Rd * tK + Lv * rs;
	const d = Cpd + (Math.pow(Lv, 2) * rs * epsilon) / (Rd * Math.pow(tK, 2));
	return (1 / p) * (n / d);
}
