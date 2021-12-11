

{
	// function toKft(v){
	// 	return Number(v.join(""))*100

	// }
    function flattenSkyCondition(L1,L2) {
        if(!!L2) return [L1,L2.flat()]
        return [L1]
    }
	function getUTCDate( DDHHMM ){
		const { year, month } = options
		return new Date(Date.UTC(year,month,...DDHHMM))//.g
	}
	class EncodingException {
		constructor({ type, message, found, expected }) {
			this.type = type
			this.message = message
			this.expected = expected
			this.found = found
		}
	}
    

  }
  
RUN = MessageHeading (BECMG_Group / TEMPO_Group)+ TemperatureGroup

//** ------------------------------------------------------------
__ "Single White Space Indicator" = 
    [ \t\n\r ] 

_NL "New Line Indicator" = 
    [\n]


//** ------------------------------------------------------------

MessageHeading 'TAF Header' =
  "TAF" __  header:(ICAO TAFTimes Line) { return header }

ICAO = @word:$[A-Z]+ &{ return options.icao.includes(word) }
    
//** -------------------------|   Line  |-----------------------------------

Line = 
WindGroup VisibilityGroup WeatherGroup CloudObscurationGroup LowLevelWindShearGroup? IcingGroup? TurbulenceGroup? LowestAltimeterGroup



//** -------|  1.3.9. Operationally significant/Hazardous weather Groups.   |----------------------
// 1.3.9. Operationally significant/Hazardous weather Groups. Volcanic ash and wind shear are
// potentially hazardous problems for aircraft. Include forecasts for ash and non-convective wind
// shear on an as-needed basis to focus the attention of the pilot on existing or expected problems

//** ------------------------|   (VAbbbttt)   |------------------------------------    
VolcanicAshGroup "1.3.9.2. Volcanic Ash (VA) Group (VAbbbttt)" =
__ "VA"

//** ------------------------|  (WShxhxhx/dddfffKT)   |------------------------------------    
// 1.3.9.2. Non-Convective Low-Level Wind Shear Group (WShxhxhx/dddfffKT)
LowLevelWindShearGroup "1.3.9.2. Non-Convective Low-Level Wind Shear Group (WShxhxhx/dddfffKT)" =
//Use this group only to forecast wind shear not associated with convective 
//activity from the surface up to and including 2,000 feet AGL
__ "WS" hxhxhx:([0]([0,1][0-9]/[2][0])) "/" ddd:Direction ff:([0-9][0-9])"KT" {
	const height = Number(hxhxhx.flat().join(""))*100
	return ["WS",height, ddd, Number(ff.join(""))]}

//-------------|1.3.10. Icing Group && 1.3.11. Turbulence Group ---------
// Forecast icing group used to forecast icing not associated
// with thunderstorms (thunderstorm forecasts imply moderate or greater icing). Repeat as
// necessary to indicate multiple icing layers. Omit when no icing is forecast. Format icing
// groups as:

// Forecast turbulence group used only to forecast
// turbulence not associated with a thunderstorm (thunderstorms already imply severe or extreme
// turbulence). Turbulence forecasts apply to category II (CAT II) aircraft. 

//-------------|(6IchihihitL)  |---------
IcingGroup "1.3.10. Icing Group (6IchihihitL)" = 
__ icing:([6][0-9]BaseHeight Thickness) {return icing}
//-------------| (5BhBhBhBtL) |-------
TurbulenceGroup "1.3.11. Turbulence group (5BhBhBhBtL)" =
__ turb:([5][0-9]BaseHeight Thickness) {return turb}
//	BASE HEIGHT
BaseHeight "Table 1.4. Height of Lowest Level of Turbulence (hBhBhB)/Icing (hihihi)" =
bH:(([0]([0][0-9] / [1][0,1] /[9][9])) / ([1][0,1,2][0]))   { return bH.flat().join("")*100 }
//	THICKNESS
Thickness "Thickness (tL)" = tL:([0-9]){return Number(tL)*1000}
//** ------------------------|  BECMG   |------------------------------------    
BECMG_Group "\
Becoming (BECMG)—The change-indicator group TTTTT YYGG/YYGeGe in\
the form of BECMG YYGG/YYGeGe is used to indicate a change to forecast prevailing\
conditions expected to occur at either a regular or irregular rate at an unspecified time\
within the period defined by a two-digit date (YY), two-digit change beginning time (GG)\
with a slash separating a two-digit date (YY) and a two-digit ending time (GeGe) in whole\
hours. The time-period described by a BECMG group is usually for one hour but never\
exceeds two hours. This change to the predominant conditions are followed by a\
description of all elements for which the change is forecast. The forecast conditions\
encoded after the BECMG YYGG/YYGeGe group are those elements expected to prevail\
from the ending time of this change group (GeGe) to the ending time of the forecast period\
" = 
_NL becmgGroup:("BECMG"  UTCStartStop Line ) {return  becmgGroup}


//** ------------------------------------------------------------

TEMPO_Group "\
Temporary (TEMPO)—The change-indicator group TTTTT YYGG/YYGeGe in\
the form of TEMPO YYGG/YYGeGe group is used to indicate temporary fluctuations to\
the forecast meteorological conditions.\
"= 
_NL   tempo:("TEMPO" UTCStartStop TEMPO_Line ){return tempo}


TEMPO_Line "Tempo Line" = 
    line :( WindGroup? VisibilityGroup? WeatherGroup? CloudObscurationGroup? LowLevelWindShearGroup? IcingGroup? TurbulenceGroup?) {
		const [ dddff, vvvv, ww, nnnhhh, ...misc]=line
		if(!dddff && !ww.some(el => el !== null) && !nnnhhh)throw new EncodingException({
			type:'SyntaxException',
            message:"Tempo groups should contain either wind speed, present weather or cloud cover",
            found: location()
            })
		return line
	}



//-----------------------| Turbulence group (5BhBhBhBtL)| -------------------------------------

TAFTimes "Issue & Valid Time Period DDHHMMZ DDHH/DDHH" =
    __ issued:( DD HH MM ) "Z" startAndStop:UTCStartStop { return [getUTCDate(issued), ...startAndStop] }


UTCStartStop =    
	__ start:( UTCDateHour ) "/" end: ( UTCDateHour ) {return [start, end]}

UTCDateHour = DDHH:(DD HH){return getUTCDate(DDHH)}
 
DD = dd:([0,1,2][0-9] / [3][0,1])  {return dd.join("")}

HH = hh:([0,1][0-9] / [2][1,2,3,4]) {return hh.join("") }

MM = mm:([0,1,2,3,4,5,6][0-9]) { return mm.join("") }

//** ----------------------| WX |----------------------
WeatherGroup "\
[Weather (w'w') Group]: intensity/proximity, followed by description,followed by precipitation type \
(two precipitation types can be used in the same w'w' group), obscuration, or \
other weather phenomena (e.g., +SHRA is heavy showers of rain, +TSRAGR is \
thunderstorms, heavy rain, and hail; -RASN is light rain and snow; TS is\
thunderstorm without precipitation)."= 
    allPossibleWXConditions:( (ThunderStorms / Precipitation)? Obscuration? Vicinity? ) {
        return allPossibleWXConditions
    } //{return {currentWx:wx.map(v=>!!v?v.join(""):"")}}
// -----------------| QUALIFIERS |-----------------
// 1.) INTENSITY OR PROXIMITY
Intensity = ("-"/"+")
Vicinity = 
    __ wx:("VC" ("TS" / "SH" / "FG" / ("BL" ("SN" / "DU" / "SA")) / "PO" / "SS" / "DS" )){return wx.flat().join("")}
// 2.) DESCRIPTORS
ThunderStorms =
    __ wx:(Intensity? "TS" ("RA" / "SN")? ("GR")?){return wx.flat().join("")}

// ---------------- |   WEATHER PHENOMENA | ---------------------
// 3.) PRECIPITATION
Precipitation = 
    __ Intensity? ("DZ" / Rain)  

Rain = wx:(("SH" / "FZ")? "RA" ("SN")?){return wx.join("")}

// 4.) OBSCURATION
Obscuration = 
    __ wx:(Mist / Fog / Smoke / VolcanicAsh / WidespreadDust / Sand / Haze / Spray ){return wx.join("")}

Mist = "BR"
Fog = "FG"
Smoke = "FU" 
VolcanicAsh = "VA"
WidespreadDust = wx:(("BL")?"DU")//{return wx.join("")}
Sand ="SA"
Haze = "HZ"
Spray = "PY"
// BR = __ wx:"BR" {return wx}

// OTHER




//** ----------------------| WIND GROUP |----------------------

WindGroup "1.3.4. Wind Group (dddffGfmfmKT). Surface wind direction, speed and gusts, if any." =
    __ 
    direction:( ddd:( Direction / "VRB" ) { 
		return ddd
        // if(ddd==="VRB") return ddd
        // return ddd.join("")
    }) 
    speed:( Sustained / Gusting )  {


         return [direction,...speed]
     }

Direction = ddd:([0,1,2][0-9][0] / [3][0-6][0]) {return ddd.join("")}


Sustained =
    windSpeed:(ValidWinds) "KT" {return [windSpeed, null]}

Gusting "Wind Gusts" =
    ff:ValidWinds "G" fm:ValidWinds "KT" {
        const ws = Number(ff)
        const wg = Number(fm)

        if(ws>=wg) throw new EncodingException({
			type:'SyntaxException',
            message:"Forecast Gust Should be greater than Forecast Windspeeds",
            found: location()
            })
        return [ff, fm]
    }



ValidWinds =
     wind:([0-9][0-9]) {return Number(wind.join(""))}

// 

//** ----------------------| Visibility Group (VVVV) |----------------------
    
VisibilityGroup "Visibility Group (VVVV)" = 
    __ vis: (
        '0000' / '0100' / '0200' / '0300' / '0400' / '0600' / '0700' / '0800' / '0900' / 
        '1000' / '1100' / '1200' / '1200' / '1400' / '1500' / '1600' / '1700' / '1800' / 
        '2000' / '2200' / '2400' / '2600' / '2800' / '3000' / '3200' / '3400' / '3600' / 
        '3700' / '4000' / '4400' / '4500' / '4700' / '4800' /'5000' / '6000' / '7000' / 
        '8000' / '9000' / '9999') { 

            if (options.isConusLocation && vis === "4800") {
				throw new EncodingException({
					type:'SyntaxException',
					message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
					found: location()
					})
    
            } else if (!options.isConusLocation && vis === "5000") throw new EncodingException({
				type:'SyntaxException',
				message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.",
				found: location()
				})

            return Number(vis)
            }



//** ----------------------| CloudObscurationGroup (NsNsNshshshsCC). |----------------------

CloudObscurationGroup "CloudObscurationGroup (NsNsNshshshsCC)" =
    sc:( SKC / FEW / SCT / BKN / Overcast / VV ) { return [...sc].flat() }

VV = __ nnn:("VV" CloudBase){ return [[nnn]] }

SKC =   
    __ skc:("SKC"){return [skc]}

FEW "(FEW = trace to 2/8ths);" = 
    nnn:( L1:FewCoverage L2:( FEW / SCT / Broken / Overcast )?{
        return flattenSkyCondition(L1,L2)
    })+{ return nnn }

SCT "(SCT = 3/8ths to 4/8ths);" = 
    nnn:( L3:Scattered L4:( Scattered / BKN / Overcast )? L5:(BKN / Overcast )?{
        return [[L3,L4,L5]]
        // return flattenSkyCondition(L3,L4)
    } ) { return [[nnn]] }

BKN "(BKN = 5/8ths to 7/8ths);" = 
    nnn:(L5:Broken L6:( Broken / Overcast )?L7:( Broken / Overcast )?L8:(  Overcast )?{
        // L1 returns an array 
        return [[L5,L6, L6, L7, L8]]//flattenSkyCondition(L1,L2)
    }) { return [[nnn]] }

FewCoverage =
__ nnn: "FEW" base:CloudBase { return [nnn,...base] }

Scattered =
__ nnn: "SCT" base:CloudBase { return [nnn,...base] }

Broken = 
__ nnn: "BKN" base:CloudBase { return [nnn,...base] }

Overcast "(OVC = 8/8ths);" = 
__ nnn: "OVC" base:CloudBase { return [[nnn,...base]] }

CloudBase = 
    base:([0,1,2,3][0-9][0-9])tsFlag:'CB'? {
        if(!!tsFlag) return [Number(base.join("")*100), true]
        return [Number(base.join("")*100), false]
        }


//** ----------------------| ALTSG |----------------------
LowestAltimeterGroup "1.3.12. Lowest Altimeter group (QNHP1P1P1P1INS)" =
 __ "QNH" alt:("29"/ "30") stg:([0-9][0-9]) "INS" {
     return [Number([alt, stg.join("")].join("."))]
 }




//** -------| Forecast Maximum and Minimum Temperature groups |--------------------


TemperatureGroup "1.3.5.1. Forecast Maximum and Minimum Temperature groups (T(X)(N)[M]TFTF/YYGFGFZ)"= 
MaxTemp MinTemp

MaxTemp =
    __ "TX" tx:Temperature "/" utc:UTCDateHour "Z" {
        const dt = Date(2024,)
        return ["TX",tx, utc]
    }

MinTemp =
     __ "TN" tx:Temperature "/" utc:UTCDateHour "Z" {
         return ["TN",tx,utc]
     }

Temperature = 
    tt:("M"?[0-9][0-9]) { 
        const [minus, ...temp] = tt
        if(!!minus) tt = ['-',...temp]
        return Number(tt.join(""))
     }
    
    