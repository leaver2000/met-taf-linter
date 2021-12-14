

{
	function getUTCDate( DDHHMM ){
		const { year, month } = options
		return new Date(Date.UTC(year,month,...DDHHMM))//.g
	}
    function getLocation(value){
        return {
            value,
            range:range()
        }
    }
    function getRange(value){
        return {
            value,
            range:range()
        }
    }
    // function validateTimes ( type, [ start, stop ]){
    //     // if start occur after stop
    //     if (new Date(start) >= new Date(stop))
    //         throw new EncodingException({
    //             message:`${type} Group START time should occur before the END time`,
    //             expected:[{
    //                 type:"literal", 
    //                 description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
    //                 ],
    //             found: location()
    //             });

    //     const diffrence = Math.abs(start - stop) / 36e5;
    //     switch(type){
    //         case 'BECMG':
    //         //if diffrence is greater than 2
    //         if ( diffrence > 2 ) 
    //             throw new EncodingException({
    //                 message:"The time-period described by a BECMG group is usually for one hour but never exceeds two hours",
    //                 expected:[{
    //                     type:"literal", 
    //                     description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
    //                     ],
    //                 found: location()
    //                 });

    //             break
    //         case 'TEMPO':
    //         //if diffrence is greater than 2
    //         if ( diffrence > 2 ) 
    //             throw new EncodingException({
    //                 message:"The time-period described by a BECMG group is usually for one hour but never exceeds two hours",
    //                 expected:[{
    //                     type:"literal", 
    //                     description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
    //                     ],
    //                 found: location()
    //                 });

    //             break
    //         default:
    //             return
    //     }
  
    // }
	class EncodingException {
        type = "EncodingException"
		constructor({ message, expected, found  }) {
			this.message = message
			this.expected = expected
			this.found = found
			
		}
	}

}
//!! ERROR ERPORTING FORMAT [ HumanReadableError ; AutoText @ Reference ]
RUN = MessageHeading (( BecomingGroup / TemporaryGroup )+)? TemperatureGroup

//** ----| Message Heading (TAF [AMD or COR] CCCC YYGGggZ YYG1G1/YYG2G2). |---------

MessageHeading = 
    type:("TAF" AMD_COR? CCCC )
    issued:Issued
    time:(t:Period {
        const [ begin, end ] = t
		options.validate.times(type, { issued, begin, end }, range )
        return t
    })
    line: PredominateLine {  return [ type, time, line ] }

CCCC "ICAO; CCCC @AFMAN 15-124 1.3.2.1.3" = __
    cccc:( [A-Z][A-Z][A-Z][A-Z] )  { 
        return getLocation(cccc.join("")) 
        }

AMD_COR 'AMD or COR; ("AMD" || "COR")? @AFMAN 15-124 1.3.2.1.2.' = __
    amd_cor:( "AMD" / "COR" ) { 
        return getLocation(amd_cor) 
        }

Issued "Issue Date and Time YYGGggZ; DDHHMMZ @AFMAN 15-124 1.3.2.1.4." = __
    issued:( DD HH MM ) "Z" { 
        return getUTCDate(issued)
        }

Period "Valid Period YYG1G1/YYG2G2 as [DDHH/DDHH] @AFMAN 15-124 1.3.2.1.5."= __ 
    start:( UTCDateHour ) "/" stop: ( UTCDateHour ) {
        return [start, stop]
        }

//** ------------------------|  BecomingGroup   |------------------------------------    
BecomingGroup = _NewLine 
    type:"BECMG"
	time:( t: UTCStartStop {
        const [ begin, end ] = t
        options.validate.times( type, { begin, end }, range )
        return t
    })
	line:PredominateLine { return [ type, time, line ] }


//** -----------------------|  TemporaryGroup   |-----------------------------------
TemporaryGroup = _NewLine 
    type:"TEMPO" 
    time:( t: UTCStartStop {
        const [ begin, end ] = t
        options.validate.times( type, { begin, end }, range )
        return t
    })
    line:TemporaryLine { return [ type, time, line ] }

//** -----------------------|   PredominateLine  |-----------------------------------

PredominateLine = 
    ddfff:(value:WindGroup{
        return { value, range : range() }
    } )
    vvvv:(value:VisibilityGroup{
        return { value, range : range() }
    } )
    ww:WeatherGroup
    // ww:(value:WeatherGroup { 

    //     return { value, range : range() }
    //     })
    NNNhhh:(value:CloudObscurationGroup{
        // console.log(vvvv, ww, NNNhhh)
        options.validate.NNNhhh( [ vvvv.value, ww.value, value ], range )
 
        return { value, range : range() }
    })
	va:VolcanicAshGroup? 
	llws:LowLevelWindShearGroup? 
	ice:IcingGroup? 
	turb:TurbulenceGroup? 
	altsg:LowestAltimeterGroup




//** -----------------------|   TemporaryLine  |-----------------------------------
TemporaryLine = 
    line :( WindGroup? VisibilityGroup? WeatherGroup? CloudObscurationGroup? LowLevelWindShearGroup? IcingGroup? TurbulenceGroup?) {
		// const [ dddff, vvvv, ww, nnnhhh, ...misc]=line
		// if(!dddff && !ww.some(el => el !== null) && !nnnhhh)throw new EncodingException({
        //     message:"Tempo groups should contain either wind speed, present weather or cloud cover",
        //      expected:[{type:"literal", description:"When winds are calm, encode dddff as 00000KT; 00000KT @AFMAN 15-124 1.3.4.1.1"}],
        //     found: location()
        //     })
            // console.log(vvvv,misc )
		return line
	}

//** -------|  1.3.9. Operationally significant/Hazardous weather Groups.   |----------------------
// 1.3.9. Operationally significant/Hazardous weather Groups. Volcanic ash and wind shear are
// potentially hazardous problems for aircraft. Include forecasts for ash and non-convective wind
// shear on an as-needed basis to focus the attention of the pilot on existing or expected problems

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
        return getLocation(["WS",height, ddd, Number(ff.join(""))])
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
    icing:( [6][0-9] BaseHeight Thickness) {return getLocation(icing)}

//-------------| (5BhBhBhBtL) |-------
TurbulenceGroup "Turbulence group; (5BhBhBhBtL) @AFMAN 15-124 1.3.11." = __ 
    turb:([5][0-9]BaseHeight Thickness) {return getLocation(turb)}
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
    ww:(
        FunnelCloud? 
        Precipitation? 
        Obscuration? 
        Vicinity? 
        Other?
        ){ return getRange(ww) }
    // value:( FunnelCloud? Precipitation? Obscuration? Vicinity? Other? ) {

    //     // if (ww.filter(n => n).length>3)
    //     // throw new EncodingException({
	// 	// 	type:'EncodingException',
    //     //     message:"When more than one weather or obscuration condition.\
    //     //     exists, limit the w'w' group to three groups.When more than three\
    //     //     w'w' groups apply to a situation, select and encode the three w'w'\
    //     //     that are most significant to operations.",
    //     //     expected:[{type:"other", description:"do not encode more than 3 w'w' groups @AFMAN 15-124 1.3.6.2."}],
    //     //     found: location()
    //     //     })
    //     // 
    //     return [{location,value}]
    //     } 

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// 1.) DESCRIPTORS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Vicinity = __ 
    ww:("VC" ("TS" / "SH" / "FG" / ("BL" ("SN" / "DU" / "SA")) / "PO" / "SS" / "DS" )){return getLocation(ww.flat().join(""))};

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
SG "Snow Grains" = "SG"
IC "Ice Crystals (Diamond Dust)" = "IC"
PL "Ice Pellets" = "PL"
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


//** ----------------------| WIND GROUP |----------------------

WindGroup "WindGroup Surface wind direction, speed and gusts, if any; dddffGfmfmKT @AFMAN 15-124 1.3.4." = __ 
    direction:Direction 
    speed:( Sustained / Gusting )  {
        const [sustained, gust] = speed
        if(sustained === 0 && direction !== '000')throw new EncodingException({
            message:"Forecast Gust Should be greater than Forecast Windspeeds",
            expected:[{type:"literal", description:"When winds are calm, encode dddff as 00000KT; 00000KT @AFMAN 15-124 1.3.4.1.1"}],
            found: location()
            })
         return [direction,...speed]
     };

Direction = 
    ddd:((azi:([0,1,2][0-9][0] / [3][0-6][0]) {return azi.join("")})/ "VRB"){return ddd}

Sustained =
    ffKT:(Wind) "KT" {return [ffKT, null]}

Gusting "Wind Gusts" =
    ffG:Wind "G" 
    fmfmKT:Wind "KT" {
        if(ffG>=fmfmKT) throw new EncodingException({
			type:'EncodingException',
            message:"Forecast Gust Should be greater than Forecast Windspeeds",
            expected:[{type:"literal", description:"When winds are calm, encode dddff as 00000KT; 00000KT @AFMAN 15-124 1.3.4.1.1"}],
            found: location()
            })
        return [ffG, fmfmKT]
    }

Wind = wind:( [1,2][0-9][0-9] / [0-9][0-9] ) {return Number(wind.join(""))}



//** ----------------------| Visibility Group (VVVV) |----------------------
ZZ = [0][0]


// UnrestrictedVisibility = __ vvvv: "9999" { return Number(vvvv) }

VisibilityGroup "Visibility Group (VVVV)" = __  
    value: (
        [0][0-9]ZZ /
        [1][1-9]ZZ /
        [2][2,4,6,8]ZZ /
        [3][2,4,6,7]ZZ /
        [4][0,4,5,7,8]ZZ /
        [5-9][0]ZZ /
		[9][9][9][9]
        ) { 
            value = [Number(value.flat().join(""))]
            // const foundLocation = location()
			
            // console.log(foundLocation)
            // options.validator("VVVV",{foundLocation, value})

            // if (options.isConusLocation && vis === 4800) {
			// 	throw new EncodingException({
			// 		type:'SyntaxException',
			// 		message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
			// 		found: location()
			// 		})
    
            // } else if (!options.isConusLocation && vis === 5000) throw new EncodingException({
			// 	type:'SyntaxException',
			// 	message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
			// 	found: location()
			// 	})

            return value
            }

//** ----------------------| CloudObscurationGroup (NsNsNshshshsCC). |----------------------


CloudObscurationGroup = SKC / VV / Octaves

SKC = __ 
	skc:("SKC"){return [skc]}

Octaves = NNNhhh:( FEW? FEW? SCTCB? SCT? BKNCB? BKN? BKN? OVC? ) {return NNNhhh.filter(f=>f)}

VV = __ 
    nnn:("VV" CloudBase){ return [[nnn]] }







// Octaves = ( FEW? FEW? SCT? SCT? BKNCB? BKN? BKN? OVC? ) 

FEW "(FEW = trace to 2/8ths);"= __
    nnn: "FEW" hhh:CloudBase { return [nnn, hhh] }

////////////////|	 SCATTERED		|//////////////
SCT "(SCT = 3/8ths to 4/8ths)"= __ 
    nnn: "SCT" hhh:CloudBase { return [nnn, hhh] }

SCTCB =  
	nnnHHH: SCT 
	cb:CB?  { return [...nnnHHH, cb] }

////////////////|	 BROKEN		|//////////////
BKN "(BKN = 5/8ths to 7/8ths)" = __
    nnn: "BKN" hhh:CloudBase { return [ nnn,hhh ] }

BKNCB =  
	nnnHHH: BKN 
	cb:CB?  { return [...nnnHHH, cb] }





OVC "(OVC = 8/8ths);" = __
	nnn: "OVC" hhh:CloudBase cb:CB?  { return [nnn, hhh, cb] }


CB = cb:"CB"{return true}
CloudBase = base:( [0,1,2][0-9][0-9] / [3][0-9][0] ){return Number(base.join("")*100) }



//** ----------------------| ALTSG |----------------------
LowestAltimeterGroup "1.3.12. Lowest Altimeter group (QNHP1P1P1P1INS)" = __ 
    "QNH" alt:([2,3][0-9]) stg:([0-9][0-9]) "INS" {
     return Number([alt.join(""),stg.join("")].join("."))
 }


//** -------| Forecast Maximum and Minimum Temperature groups |--------------------

TemperatureGroup "1.3.5.1. Forecast Maximum and Minimum Temperature groups (T(X)(N)[M]TFTF/YYGFGFZ)"= 
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