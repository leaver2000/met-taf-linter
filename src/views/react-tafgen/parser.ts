import * as peggy from 'peggy';
const ICAO = 'KADW';

class OneTwentyFour {
	isConusLocation: boolean;
	// isConusLocation: undefined | boolean = undefined;
	constructor(isConusLocation: boolean) {
		this.isConusLocation = isConusLocation;
	}
	reportableVisibility() {
		const { isConusLocation } = this;
		return `"${[
			//
			...['0000', '0100', '0200', '0300', '0400', '0600', '0700', '0800', '0900'], //0000-0999
			...['1000', '1100', '1200', '1200', '1400', '1500', '1600', '1700', '1800'], //1000-1999
			...['2000', '2200', '2400', '2600', '2800', '3000', '3200', '3400', '3600', '3700'], //2000-3999
			...['4000', '4400', '4500', '4700', `${isConusLocation ? '5000' : '4800'}`],
			...['6000', '7000', '8000', '9000', '9999'],
		].join('" / "')}"`;
	}
}

const one24 = new OneTwentyFour(true);
/** */
export const parser = peggy.generate(`
//* TAF PARSER
start =
	head:TAF" "wind:WIND" "vis:VIS" "skyCover:SKY_COVER {
		return { head, wind, vis:Number(vis), skyCover }; 
	}

//* HEAD PARSER
TAF =
	'TAF ${ICAO}'
	

//* WIND PARSER
WIND =
	dir:wDir spd:wSpd {
		return {
			dir:Number(dir.join("")),
			spd:spd
	}}

wDir =
	[0,1,2,3][0-9][0]

wSpd =
	[0-9][0-9]"KT" / [0-9][0-9]"G"[0-9][0-9]"KT"
	
//* WIND PARSER
VIS = ${one24.reportableVisibility()} 

//* CLO-UD PARSER
SKY_COVER =
	cldCover cldBase
	
cldCover = 
	"SCT" / "FEW" / "BKN" / "OVC" 

cldBase = 
	[0,1,2,3][0-9][0-9]



`);
