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
const WINDS = `
Winds =
	dir:WindDir spd:WindSpeed {
		return {
			dir:Number(dir.join("")),
			spd:spd.join("")
	}}

WindDir =
	[0,1,2,3][0-9][0]

WindSpeed =
	[0-9][0-9]"KT" / [0-9][0-9]"G"[0-9][0-9]"KT"
	
`
// const SKY_CONDITION = `
// SkyCondition =
//     ClourCover CloudBase

// ClourCover = 
// 	"SCT" / "FEW" / "BKN" / "OVC" 

// CloudBase = 
// 	[0,1,2,3][0-9][0-9]

// `
export const parser = peggy.generate(`
//* TAF PARSER

START = TAFLine BECMG

// Space
__ = " "

TAFLine =
	"TAF ${ICAO}" __ Line 

BECMG = 
    ( "BECMG")?

NewLine =
    " "
Line = 
    Winds Visibility CurrentWeather SkyCondition Altsg 

CurrentWeather = 
    wx:WX  {return {currentWx:wx.map(v=>!!v?v.join(""):"")}}

WX = 
    (__ Mods "RA" )? (__ Mods "SHRA")? (__ "BR" )? 

Mods = 
    "" / "-" / "+"


${WINDS}
SkyCondition =
    __ ClourCover CloudBase
	
ClourCover = 
	"SCT" / "FEW" / "BKN" / "OVC" 

CloudBase = 
	[0,1,2,3][0-9][0-9]


    
Visibility = 
    __ ReportableVisibility

ReportableVisibility =
    ${one24.reportableVisibility()} 


Altsg =
    __ "QNH" ("29"/ "30") [0-9][0-9] "INS"


`);



