

{
	function getUTCDate( DDHHMM ){
		const { year, month } = options
		return new Date(Date.UTC(year,month,...DDHHMM))//.g
	}
    function validateTimes ( type, [ start, stop ]){
        // if start occur after stop
        if (new Date(start) > new Date(stop))
            throw new EncodingException({
                message:`${type} group start time begins after the endtime`,
                expected:[{
                    type:"literal", 
                    description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
                    ],
                found: location()
                });

        const diffrence = Math.abs(start - stop) / 36e5;
        switch(type){
            case 'BECMG':
            //if diffrence is greater than 2
            if ( diffrence > 2 ) 
                throw new EncodingException({
                    message:"The time-period described by a BECMG group is usually for one hour but never exceeds two hours",
                    expected:[{
                        type:"literal", 
                        description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
                        ],
                    found: location()
                    });

                break
            case 'TEMPO':
            //if diffrence is greater than 2
            if ( diffrence > 2 ) 
                throw new EncodingException({
                    message:"The time-period described by a BECMG group is usually for one hour but never exceeds two hours",
                    expected:[{
                        type:"literal", 
                        description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
                        ],
                    found: location()
                    });

                break
            default:
                return
        }
  
    }
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
RUN = MessageHeading ((BecomingGroup / TemporaryGroup)+)? TemperatureGroup

//** ----| Message Heading (TAF [AMD or COR] CCCC YYGGggZ YYG1G1/YYG2G2). |---------

MessageHeading = header:(("TAF" AMD_COR? CCCC) Issued Period PredominateLine) { return header }

CCCC "ICAO; CCCC @AFMAN 15-124 1.3.2.1.3" = __
    cccc:( [A-Z][A-Z][A-Z][A-Z] )  { return cccc.join("") }

AMD_COR 'AMD or COR; ("AMD" || "COR")? @AFMAN 15-124 1.3.2.1.2.' = __
    amd_cor:( "AMD" / "COR" ) { return amd_cor }

Issued "Issue Date and Time YYGGggZ; DDHHMMZ @AFMAN 15-124 1.3.2.1.4." = __
    issued:( DD HH MM ) "Z" { return getUTCDate(issued) }

Period "Valid Period YYG1G1/YYG2G2 as [DDHH/DDHH] @AFMAN 15-124 1.3.2.1.5."= __ 
    start:( UTCDateHour ) "/" stop: ( UTCDateHour ) {return [start, stop]}

//** ------------------------|  BecomingGroup   |------------------------------------    
BecomingGroup = _NewLine 
    type:"BECMG" time:UTCStartStop line:PredominateLine  {
        const [ start, stop ] = time;
        const hours = Math.abs(start - stop) / 36e5;
        validateTimes("BECMG",time)
        return [ type, time, line ]
    }

//** -----------------------|  TemporaryGroup   |-----------------------------------
TemporaryGroup = _NewLine 
    type:"TEMPO" time:UTCStartStop line:TemporaryLine {
        return [ type, time, line ]
        }

//** -----------------------|   PredominateLine  |-----------------------------------
PredominateLine = 
    WindGroup VisibilityGroup WeatherGroup CloudObscurationGroup VolcanicAshGroup? LowLevelWindShearGroup? IcingGroup? TurbulenceGroup? LowestAltimeterGroup
//** -----------------------|   TemporaryLine  |-----------------------------------
TemporaryLine = 
    line :( WindGroup? VisibilityGroup? WeatherGroup? CloudObscurationGroup? LowLevelWindShearGroup? IcingGroup? TurbulenceGroup?) {
		const [ dddff, vvvv, ww, nnnhhh, ...misc]=line
		if(!dddff && !ww.some(el => el !== null) && !nnnhhh)throw new EncodingException({
            message:"Tempo groups should contain either wind speed, present weather or cloud cover",
             expected:[{type:"literal", description:"When winds are calm, encode dddff as 00000KT; 00000KT @AFMAN 15-124 1.3.4.1.1"}],
            found: location()
            })
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

//** ------------------------|  (WShxhxhx/dddfffKT)   |------------------------------------    
// 1.3.9.2. Non-Convective Low-Level Wind Shear Group (WShxhxhx/dddfffKT)
//Use this group only to forecast wind shear not associated with convective 
//activity from the surface up to and including 2,000 feet AGL
LowLevelWindShearGroup "Non-Convective Low-Level Wind Shear Group; (WShxhxhx/dddfffKT) @AFMAN 15-124 1.3.9.2." = __
    "WS" 
    hxhxhx:([0]([0,1][0-9]/[2][0])) "/" 
    ddd:Direction ff:([0-9][0-9])"KT" {
        const height = Number(hxhxhx.flat().join(""))*100
        return ["WS",height, ddd, Number(ff.join(""))]
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
    icing:([6][0-9]BaseHeight Thickness) {return icing}

//-------------| (5BhBhBhBtL) |-------
TurbulenceGroup "Turbulence group; (5BhBhBhBtL) @AFMAN 15-124 1.3.11." = __ 
    turb:([5][0-9]BaseHeight Thickness) {return turb}
//	BASE HEIGHT
BaseHeight = bH:(([0]([0][0-9] / [1][0,1] /[9][9])) / ([1][0,1,2][0]))   { return bH.flat().join("")*100 }
//	THICKNESS
Thickness = tL:([0-9]){return Number(tL)*1000}



//** ----------------------| WX |----------------------
WeatherGroup "\
[Weather (w'w') Group]: intensity/proximity, followed by description,followed by precipitation type \
(two precipitation types can be used in the same w'w' group), obscuration, or \
other weather phenomena (e.g., +SHRA is heavy showers of rain, +TSRAGR is \
thunderstorms, heavy rain, and hail; -RASN is light rain and snow; TS is\
thunderstorm without precipitation)."= 
    allPossibleWXConditions:( Precipitation? Obscuration? Vicinity? ) {return allPossibleWXConditions} 
// -----------------| QUALIFIERS |-----------------

Intensity =("-"/"+")
Vicinity = 
    __ wx:("VC" ("TS" / "SH" / "FG" / ("BL" ("SN" / "DU" / "SA")) / "PO" / "SS" / "DS" )){return wx.flat().join("")}
// 2.) DESCRIPTORS
ThunderStorms =
    ts:(Intensity? "TS" ("RA" / "SN")? ("GR")?){return ts}

// ---------------- |   WEATHER PHENOMENA | ---------------------
// 3.) PRECIPITATION
Precipitation = 
    __ p:(Intensity? (ThunderStorms / "DZ" / Rain) ) {return p}

Rain = wx:(("SH" / "FZ")? "RA" ("SN")?){return wx.join("")}

// 4.) OBSCURATION
Obscuration = 
    __ wx:(Mist / Fog / Smoke / VolcanicAsh / WidespreadDust / Sand / Haze / Spray ){return wx}

Mist = "BR"
Fog = "FG"
Smoke = "FU" 
VolcanicAsh = "VA"
WidespreadDust = wx:(("BL")?"DU")//{return wx.join("")}
Sand ="SA"
Haze = "HZ"
Spray = "PY"





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
     }

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

VisibilityGroup "Visibility Group (VVVV)" = 
    __ vis: (
        [0][0-9]ZZ /
        [1][1-9]ZZ /
        [2][2,4,6,8]ZZ /
        [3][2,4,6,7]ZZ /
        [4][0,4,5,7,8]ZZ /
        [5-9][0]ZZ / 
        [9][9][9][9]
        ) { 
            vis = Number(vis.flat().join(""))

            if (options.isConusLocation && vis === 4800) {
				throw new EncodingException({
					type:'SyntaxException',
					message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
					found: location()
					})
    
            } else if (!options.isConusLocation && vis === 5000) throw new EncodingException({
				type:'SyntaxException',
				message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
				found: location()
				})

            return vis
            }



//** ----------------------| CloudObscurationGroup (NsNsNshshshsCC). |----------------------


CloudObscurationGroup = SKC / VV / (FEW?FEW?SCT?SCT?BKN?BKN?BKN?OVC?) 

VV = __ nnn:("VV" CloudBase){ return [[nnn]] }

SKC =   
__ skc:("SKC"){return [skc]}

FEW "(FEW = trace to 2/8ths);"=
__ nnn: "FEW" base:CloudBase { return [nnn,...base] }

SCT "(SCT = 3/8ths to 4/8ths)"=
__ nnn: "SCT" base:CloudBase { return [nnn,...base] }

BKN "(BKN = 5/8ths to 7/8ths)" = 
__ nnn: "BKN" base:CloudBase { return [nnn,...base] }

OVC "(OVC = 8/8ths);" = 
__ nnn: "OVC" base:CloudBase { return [[nnn,...base]] }

CloudBase = 
    base:([0,1,2,3][0-9][0-9])tsFlag:'CB'? {
        if(!!tsFlag) return [Number(base.join("")*100), true]
        return [Number(base.join("")*100), false]
        }


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