{
    /*eslint no-unused-vars: [1, { "varsIgnorePattern": "text|offset|location|expected|error|(peg\\$.*)" }]*/
	function getUTCDate( DDHHMM ){
		const { year, month } = options
		return new Date(Date.UTC(year,month,...DDHHMM))
	}
    const { validate } = options
}
/** 
1.3. TAF Encoding.
1.3.1. TAF Code Format. Use the following format in Figure 1.1 for encoding TAFs:
    Figure 1.1. TAF Code Format.
    TAF (AMD or COR) CCCC YYGGggZ YYG1G1/YYG2G2 dddffGfmfmKT VVVV 
    w’w’ NsNsNshshshsCC or VVhshshs or SKC (VAbbbttt) (WShxhxhx/dddfffKT) 
    (6IchihihitL) (5BhBhBhBtL) QNHP1P1P1P1INS (Remarks)
    TTTTT YYGGGeGe or YYGG/YYGeGe ddffGfmfmKT…same as above… (Remarks) 
    TX(M)TFTF/YYGFGFZ TN(M)TFTF/YYGFGFZ
*/
RUN = ( MessageHeading PredominateLine ) (( BecomingGroup / TemporaryGroup )+)? TemperatureGroup
/** 
1.3.2.1. Message Heading (TAF [AMD or COR] CCCC YYGGggZ YYG1G1/YYG2G2). 
*/
MessageHeading = 
    head:("TAF" AMD_COR? CCCC )
    YYGGggZ: IssuedTime
    YYG1G1_YYG2G2: ValidPeriod {
        const AMD_COR = head[1];
		validate._YYGGggZ( YYGGggZ, ...YYG1G1_YYG2G2, { AMD_COR }, range )
        return YYG1G1_YYG2G2
    };

AMD_COR "AMD or COR; ('AMD' || 'COR')? @AFMAN 15-124 1.3.2.1.2." = __
    amd_cor:( "AMD" / "COR" ) { return amd_cor; }

CCCC "ICAO; CCCC @AFMAN 15-124 1.3.2.1.3" = __
    cccc:( [A-Z][A-Z][A-Z][A-Z] )  { 
        return cccc.join("")
        }

IssuedTime "YYGGggZ" = __
    issued:( DD HH MM ) "Z" { return getUTCDate(issued); }

ValidPeriod "YYG1G1/YYG2G2"= __ 
    start:( UTCDateHour ) "/" stop: ( UTCDateHour ) { return [start, stop]; }

/** 
1.3.3.1. Becoming (BECMG)—The change-indicator group TTTTT YYGG/YYGeGe
*/ 
BecomingGroup = _NewLine 
    type: "BECMG"
	time:( time: UTCStartStop {
        validate._YYG1G1_YYG2G2( type, ...time, range );
        return time;
    })
	pLine:PredominateLine { return [ type, time, pLine ]; }

// PredominateLines are used in the Message Header Becoming Groups
PredominateLine = 
    ddfff:( ddfff: WindGroup {
        return ddfff
    })
    vvvv:VisibilityGroup
    ww:( _ww: WeatherGroup {
        validate._VVVV_ww( [ vvvv, _ww ], range )
        return _ww
    })
    NNNhhh: ( _NNNhhh:CloudObscurationGroup {
        // if lowest layer is sfc based
        // if(_NNNhhh[0][1]===0)validate._SurfaceBasedPartialObscuration(vvvv)
        validate._ww_NNNhhhCC( [ vvvv,ww, _NNNhhh ], range )
        return  _NNNhhh
    })
	va:VolcanicAshGroup? 
	llws:LowLevelWindShearGroup? 
	ice:IcingGroup? 
	turb:TurbulenceGroup? 
	altsg:LowestAltimeterGroup

/**
1.3.3.2. Temporary (TEMPO)—The change-indicator group TTTTT YYGG/YYGeGe
*/
TemporaryGroup = _NewLine 
    type: "TEMPO" 
    time:( time: UTCStartStop {
        validate._YYG1G1_YYG2G2( type,  ...time, range );
        return time;
    })
    tLine:TemporaryLine { return [ type, time, tLine ]; }

// TemporaryLine are used in the Message Header Temporary Groups
TemporaryLine = 
    ddfff:( _ddfff: WindGroup {
        return _ddfff
    })
    vvvv:( _vvvv: VisibilityGroup {
        return  _vvvv
    })
    ww:( _ww: WeatherGroup{
        validate._VVVV_ww( [ vvvv, _ww ], range )
        return _ww
    })?
    NNNhhh:( _NNNhhh : CloudObscurationGroup {

        validate._ww_NNNhhhCC( [ ww, _NNNhhh ], range )
        return  _NNNhhh
    })
    LowLevelWindShearGroup? 
    IcingGroup? 
    TurbulenceGroup?

/**
1.3.3.3. From (FMYYGGgg)—The time indicator YYGGgg in the form of FMYYGGgg 
is used to indicate the beginning of a self
*/

/** FROM GROUP NOT USED */

/**
1.3.4. Wind Group (dddffGfmfmKT). Surface wind direction, speed and gusts, if any.
*/
WindGroup "WindGroup Surface wind direction, speed and gusts, if any; dddffGfmfmKT @AFMAN 15-124 1.3.4." = __ 
    ddd:Direction 
    ffGfmfmKT:( Sustained / Gusting )  {
        return validate._dddffGfmfmKT(ddd,...ffGfmfmKT, range);
     };

Direction = 
    ddd:((azi:([0,1,2][0-9][0] / [3][0-6][0]) {return azi.join("")})/ "VRB"){return ddd}

Sustained =
    ff:(Wind) "KT" {return [ff, null]}

Gusting "Wind Gusts" =
    ff:Wind "G" 
    fmfm:Wind "KT"  { return [ ff, fmfm ] };

Wind = wind:( [1,2][0-9][0-9] / [0-9][0-9] ) {return Number(wind.join(""))}

/**
1.3.5. Visibility Group (VVVV). 
Forecast prevailing visibility in meters, rounded down to the nearest reportable value.

reportableValues = [
  0000 0100 0200 0300 0400 0500 0600 0700 0800 0900
  1000 1100 1200 1300 1400 1500 1600 1700 1800 1900
  2000 2200 2400 2600 2800 2900 
  3000 3200 3400 3600 3700
  4000 4400 4500 4700 ( 4800 | 5000 ): see Note
  6000 7000 8000 9000 9999
]

Note: Substitute 5000 meters for 4800 meters Outside the Continental 
United States (OCONUS) locations based on the host-nation national 
practice
*/
VisibilityGroup "Visibility Group (VVVV)" = __  
    VVVV: (
        [0][0-9]ZZ /
        [1][0-8]ZZ /
        [2][2,4,6,8]ZZ /
        [3][2,4,6,7]ZZ /
        [4][0,4,5,7,8]ZZ /
        [5-9][0]ZZ /
		[9][9][9][9]
        ) { return validate._VVVV([Number(VVVV.flat().join(""))], range) };

ZZ = [0][0]

/**
1.3.7. Cloud and Obscuration Group (NsNsNshshshsCC).
Report as often as necessary to indicate all forecast cloud layers up to the first overcast layer.
Arrange groups in ascending order of cloud bases AGL (e.g., lowest base first). (T-0)

*/
CloudObscurationGroup = NNNhhh:( SKC / VerticalVisibility / CloudAmount ) {
    
    return NNNhhh.filter(f=>f)
    }

SKC = __ 
	skc:("SKC"){return [[skc]]}

VerticalVisibility = __ 
    nnn:"VV" 
    hhh:(hhh:([0][0][0-9]){
        return Number(hhh.join("")*100)
        }){  return[[nnn, hhh]] }

CloudAmount = NNNhhh:( FEW? FEW? SCTCB? SCT? BKNCB? BKN? BKN? OVC? )//{return NNNhhh.filter(f=>f)}

FEW "(FEW = trace to 2/8ths);"= __
    nnn: "FEW" hhh:CloudBase { return [nnn, hhh] }

//      SCATTERED
SCT "(SCT = 3/8ths to 4/8ths)"= __ 
    nnn: "SCT" hhh:CloudBase { return [nnn, hhh] }

SCTCB =  
	nnnHHH: SCT 
	cb:CB?  { return [...nnnHHH, cb] }

//      BROKEN
BKN "(BKN = 5/8ths to 7/8ths)" = __
    nnn: "BKN" hhh:CloudBase { return [ nnn,hhh ] }

BKNCB =  
	nnnHHH: BKN 
	cb:CB?  { return [...nnnHHH, cb] }

//      OVERCAST
OVC "(OVC = 8/8ths);" = __
	nnn: "OVC" hhh:CloudBase cb:CB?  { return [nnn, hhh, cb] }

CB = cb:"CB"{return !!cb}

CloudBase = base:( [0,1,2][0-9][0-9] / [3][0-9][0] ){return Number(base.join("")*100) }




/** 
1.3.9. Operationally significant/Hazardous weather Groups. 
Volcanic ash and wind shear arepotentially hazardous problems for aircraft.
Include forecasts for ash and non-convective wind shear on an as-needed basis
to focus the attention of the pilot on existing or expected problems
*/
//** ------------------------|   (VAbbbttt)   |------------------------------------    
VolcanicAshGroup "Volcanic Ash (VA) Group; (VAbbbttt) @AFMAN 15-124 1.3.9.2." = __
    "VA" 

//** -----|  1.3.9.2. Non-Convective Low-Level Wind Shear Group (WShxhxhx/dddfffKT)  |--------------
//Use this group only to forecast wind shear not associated with convective 
//activity from the surface up to and including 2,000 feet AGL
LowLevelWindShearGroup "Non-Convective Low-Level Wind Shear Group; (WShxhxhx/dddfffKT) @AFMAN 15-124 1.3.9.2." = __
    "WS" 
    hxhxhx:([0]([0,1][0-9]/[2][0])) "/" 
    ddd:Direction ff:([0-9][0-9])"KT" {
        const height = Number(hxhxhx.flat().join(""))*100
        return ["WS",height, ddd, Number(ff.join(""))]//getRange(["WS",height, ddd, Number(ff.join(""))])
    }

//-------------|1.3.10. Icing Group && 1.3.11. Turbulence Group ---------
// Forecast icing group used to forecast icing not associated
// with thunderstorms (thunderstorm forecasts imply moderate or greater icing). Repeat as
// necessary to indicate multiple icing layers. Omit when no icing is forecast. Format icing
// groups as: Forecast turbulence group used only to forecast
// turbulence not associated with a thunderstorm (thunderstorms already imply severe or extreme
// turbulence). Turbulence forecasts apply to category II (CAT II) aircraft. 

//-------------|(6IchihihitL)  |---------
IcingGroup "Icing Group; (6IchihihitL) @AFMAN 15-124 1.3.10." = __ 
    icing:( [6][0-9] BaseHeight Thickness) {return icing}//getRange(icing)}

//-------------| (5BhBhBhBtL) |-------
TurbulenceGroup "Turbulence group; (5BhBhBhBtL) @AFMAN 15-124 1.3.11." = __ 
    turb:([5][0-9]BaseHeight Thickness) {return turb}//getRange(turb)}
//	BASE HEIGHT
BaseHeight = bH:(([0]([0][0-9] / [1][0,1] /[9][9])) / ([1][0,1,2][0]))   { return bH.flat().join("")*100 }
//	THICKNESS
Thickness = tL:([0-9]){return Number(tL)*1000}



//** ----------------------| WX |----------------------
//  "\
// [Weather (w'w') Group]: intensity/proximity, followed by description,followed by precipitation type \
// (two precipitation types can be used in the same w'w' group), obscuration, or \
// other weather phenomena (e.g., +SHRA is heavy showers of rain, +TSRAGR is \
// thunderstorms, heavy rain, and hail; -RASN is light rain and snow; TS is\
// thunderstorm without precipitation).
WeatherGroup = 
        FunnelCloud? 
        Precipitation? 
        Obscuration? 
        Vicinity? 
        Other?



/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 1.) DESCRIPTORS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Vicinity = __ 
    ww:("VC" ("TS" / "SH" / "FG" / ("BL" ("SN" / "DU" / "SA")) / "PO" / "SS" / "DS" )){return ww.flat().join("")}//getRange(ww.flat().join(""))};

// Intensity = (LGT/HVY)?
// HVY = "+"
// LGT = "-"



/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 2.) DESCRIPTORS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// MI "Shallow" = "MI" 
// PR "Partial (covering part of the aerodrome)" = "PR"
// SH "Shower(s)" = "SH"
// TS "Thunderstorm" = "TS"
// FZ "Freezing" = "FZ"
// BL "Blowing"  = "BL"

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 3.) PRECIPITATION /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Precipitation = __ 
    ww:(( "+" / "-" )? ( ThunderStorms / SnowPellets / Snow / Drizzle / Rain  ) ) { return ww.join("") };

/////////////////////////////////////////////////////////////////////////////////////////////v 

ThunderStorms =
    ww:("TS" ("RA" / "SN")? ("GR")?){return ww.join("")};

SnowPellets = 
    ww:(("SN")? "GS"){return ww.join("")};

Snow = 
    ww:(("SH" / "RA")? "SN") {return ww.join("")};

Rain = 
    ww:(("SH" / "FZ")? "RA")   {return ww.join("")};

Drizzle = 
    ww:(("FZ")? "DZ"){return ww.join("")};

/////////////////////////////////////////////////////////////////////////////////////////////

// DZ "Drizzle" = "DZ"
// SN "Snow" = "SN"
// SG "Snow Grains" = "SG"
// IC "Ice Crystals (Diamond Dust)" = "IC"
// PL "Ice Pellets" = "PL"
// GR "Hail" = "GR"
// GS "Snow Pellets " = "GS"

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 4.) OBSCURATIONS //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Obscuration = __ 
    ww:( Mist / Fog / Smoke / VolcanicAsh / Dust / Sand / Haze / Spray ){return ww};

Dust = 
    ww:(("BL")?"DU"){return ww.join("")}

Spray = 
    ww:(("BL")?"PY"){return ww.join("")}

Fog = ww:(( "PR" / "BC" / "MI") "FG") { return ww.join("")}

Mist = "BR"
Smoke ="FU" 
VolcanicAsh = "VA"
Sand ="SA"
Haze = "HZ"
// 

/////////////////////////////////////////////////////////////////////////////////////////////
// BR = "BR"
// FG = "FG"
// FU = "FU" 
// VA = "VA"
// DU = "DU"
// SA = "SA"
// HZ = "HZ"
// PY = "PY"


/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 5.) OTHER /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
FunnelCloud = __
    ww: (("+")? "FC") {return ww};

Other = __
    ww:( "SQ" / "PO" / "SS" / "DS" ){return ww};

//////////////////////////////////////////////////////


//** ----------------------| ALTSG |----------------------
LowestAltimeterGroup "1.3.12. Lowest Altimeter group (QNHP1P1P1P1INS)" = __ 
    "QNH" alt:([2,3][0-9]) stg:([0-9][0-9]) "INS" {
     return Number([alt.join(""),stg.join("")].join("."))
 }


//** -------| Forecast Maximum and Minimum Temperature groups |--------------------

TemperatureGroup "(T(X)(N)[M]TFTF/YYGFGFZ)"= 
	MaxTemp MinTemp

MaxTemp = __ 
    "TX" 
    tx:Temperature "/" 
    utc:UTCDateHour "Z" { return ["TX",tx, utc] }

MinTemp =__ 
    "TN" 
    tn:Temperature "/" 
    utc:UTCDateHour "Z" { return ["TN",tn,utc] }

Temperature = 
    tt:("M"?[0-9][0-9]) { 
        const [minus, ...temp] = tt
        if(!!minus) tt = ['-',...temp]
        return Number(tt.join(""))
     }

//-----------------------|      UTC        | -------------------------------------

UTCStartStop = __
    start: ( UTCDateHour ) "/" 
    end: ( UTCDateHour ) {return [start, end]}

UTCDateHour = DDHH:(DD HH){return getUTCDate(DDHH)}
 
DD = dd:([0,1,2][0-9] / [3][0,1])  {return dd.join("")}

HH = hh:([0,1][0-9] / [2][1,2,3,4]) {return hh.join("") }

MM = mm:([0,1,2,3,4,5,6][0-9]) { return mm.join("") }

//** --------------------------| Indicators |----------------------------------
//Single Whitespace
__ = [ \t\n\r ]
//New Line
_NewLine  =  [\n]