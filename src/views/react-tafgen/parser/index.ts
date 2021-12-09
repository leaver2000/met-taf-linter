import * as peggy from 'peggy';

function makeParser() {
	return peggy.generate(`
//** ------------------------------------------------------------
{

    function flattenCloudLayers(ccc) {
        const [firstLayer, secondLayer] = ccc.flat()
        if(!!secondLayer){
            return [firstLayer,secondLayer]
        }
        return firstLayer
      }

  }
  
RUN = MessageHeading ChangeGroups+ TemperatureGroup 

//** ------------------------------------------------------------
__ "Single White Space Indicator" = 
    [ \\t\\n\\r ] 

_NL "New Line Indicator" = 
    [\\n]
//** ------------------------------------------------------------

ChangeGroups =
    BECMG_Group / TEMPO_Group


//** ------------------------------------------------------------

MessageHeading =
  "TAF" __  header:(ICAO TAFTimes Line){return header}

ICAO = @word:$[A-Z]+ &{ return options.icao.includes(word) }
    

//** ------------------------|  BECMG   |------------------------------------    
BECMG_Group "${text.becmg}" = 
     _NL "BECMG" becmgGroup:( BECMG_TimeRange Line ) {
         return { becmgGroup }
        }


BECMG_TimeRange "BECMG Group Valid Time" =
    __ startTime:( DD HH ) "/" endTime: ( DD HH ) {
        

        const start = new Date(Date.UTC(2021, 1, ...startTime))
        console.log(start.getHours())
        const end = new Date(Date.UTC(2021, 1, ...endTime))
        return { start, end }
}


//** ------------------------------------------------------------

TEMPO_Group "\
Temporary (TEMPO)—The change-indicator group TTTTT YYGG/YYGeGe in\
the form of TEMPO YYGG/YYGeGe group is used to indicate temporary fluctuations to\
the forecast meteorological conditions."= 

    _NL "TEMPO" ( TEMPO_TimeRange TEMPO_Line )


TEMPO_Line "Tempo Line" = 
    __ line :(  WX )


TEMPO_TimeRange "TEMPO Group Valid Time" =
    __ startTime:( DD HH ) "/" endTime: ( DD HH ) {
    return {startTime,endTime}
}





//** ------------------------------------------------------------
TAFTimes "Issue & Valid Time Period DDHHMMZ DDHH/DDHH" =
    issued:TAF_IssueTime validPeriod:TAF_ValidPeriod { 
        return {...issued, validPeriod }
    }

TAF_IssueTime "TAF Issue Time" = 
    __ dateTime:( DD HH MM ) "Z" {
        const {year,day} = options
        console.log(options)
        const issued = new Date(Date.UTC(2021, 1, ...dateTime))
        return { issued }
    }

TAF_ValidPeriod "TAF Valid Range" = 
     __ startTime:( DD HH ) "/" endTime: ( DD HH ) {
        const start = new Date(Date.UTC(2021,1, ...startTime))
        const stop = new Date(Date.UTC(2021,1, ...endTime))//.getHours()
        return { start, stop }
     }


DD 'Day'= 
    dd:([0,1,2][0-9] / [3][0,1])  {return dd.join("")}

HH 'Hour' = 
    hh:([0,1][0-9] / [2][1,2,3,4]) {return hh.join("") }

MM 'Minute' =
    mm:([0,1,2,3,4,5,6][0-9]) { return mm.join("") }


//** ------------------------------------------------------------

Line = 
    WindGroup VisibilityGroup CurrentWeather CloudObscurationGroup Altsg 


//** ----------------------| WX |----------------------
CurrentWeather "Current Weather"= 
    wx:WX  //{return {currentWx:wx.map(v=>!!v?v.join(""):"")}}

WX = 
    TSRA? RA? SHRA? BR? 

TSRA =
    __ wx:(Mod? "TSRA") {return wx.join("")}

SHRA = 
    __ wx:(Mod? "SHRA") {return wx.join("")}

RA = 
    __ wx:(Mod? "RA") {return wx.join("")}

BR = __ wx:"BR" {return wx}



Mod = ("-"/"+")


//** ----------------------| WIND GROUP |----------------------

WindGroup "1.3.4. Wind Group (dddffGfmfmKT). Surface wind direction, speed and gusts, if any." =
    __ 
    direction:( ddd:([0,1,2][0-9][0] / [3][0,1,2][0] / "VRB" ) { 
        if(ddd==="VRB") return ddd

        return ddd.join("")
    }) 
    speed:( Sustained / Gusting )  {

        if(direction ==="VRB" && Number(speed)>6){
            throw Error('\
            When wind speed will be more than 6 knots, do not use VRB for ddd \
            unless the situation involves air-mass thunderstorm activity during which \
            forecasting a prevailing wind direction with confidence is not possible. When it is \
            possible to forecast the peak gust direction, but not the prevailing direction, \
            encode the wind group as VRBffGfmfmKT and append the probable peak gust \
            direction to remarks (e.g., GST DRCTN 250).\
            ')
        }

         return [direction,...speed]
     }





    

Sustained =
    windSpeed:(ValidWinds) "KT" {return [windSpeed]}

Gusting "Wind Gusts" =
    ff:ValidWinds "G" fm:ValidWinds "KT" {
        const ws = Number(ff)
        const wg = Number(fm)
        if(ws>=wg) throw Error("Forecast Gust Should be greater than Forecast Windspeeds")
        return [ff, fm]
    }



ValidWinds =
     wind:([0-9][0-9]) {return Number(wind.join(""))}



//** ----------------------| Visibility Group (VVVV) |----------------------
    
VisibilityGroup "Visibility Group (VVVV)" = 
    __ vis: (
        '0000' / '0100' / '0200' / '0300' / '0400' / '0600' / '0700' / '0800' / '0900' / 
        '1000' / '1100' / '1200' / '1200' / '1400' / '1500' / '1600' / '1700' / '1800' / 
        '2000' / '2200' / '2400' / '2600' / '2800' / '3000' / '3200' / '3400' / '3600' / 
        '3700' / '4000' / '4400' / '4500' / '4700' / '5000' / '6000' / '7000' / '8000' / 
        '9000' / '9999') { return Number(vis) }



//** ----------------------| CloudObscurationGroup (NsNsNshshshsCC). |----------------------

CloudObscurationGroup "CloudObscurationGroup (NsNsNshshshsCC)" =
    sc:( SKC / FEW / SCT / BKN / OVC / VV ) { return [...sc].flat() }

VV = __ nnn:("VV" CloudBase){ return [[nnn]] }

SKC =   
    __ skc:("SKC"){return [skc]}

FEW "(FEW = trace to 2/8ths);" = 
    __ nnn:( L1:("FEW" CloudBase) L2:( FEW / SCT / BKN / OVC )?{
        if(!!L2) return [L1,...L2.flat()]
        return [L1]
    })+{ return nnn }

SCT "(SCT = 3/8ths to 4/8ths);" = 
    __ nnn:( L1:("SCT" CloudBase) L2:( SCT / BKN / OVC )?{
        if(!!L2) return [L1,...L2.flat()]
        return [L1]
    } )+ { return nnn }

BKN "(BKN = 5/8ths to 7/8ths);" = 
    __ nnn:(L1:("BKN" CloudBase) L2:( BKN / OVC )?{

        if(!!L2) return [L1,...L2.flat()]
        return [L1]
    })+ { return nnn }

OVC "(OVC = 8/8ths);" = 
    __ nnn:( "OVC" CloudBase ){ return [[nnn]] }

CloudBase = 
    cb:([0,1,2,3][0-9][0-9]) {return Number(cb.join("")*100)}


//** ----------------------| ALTSG |----------------------
Altsg =
 __ "QNH" alt:("29"/ "30") stg:([0-9][0-9]) "INS" {
     return [Number([alt, stg.join("")].join("."))]
 }


DateHourUTC = 
    DDHH:(DD HH){
        return new Date(Date.UTC(2021,1, ...DDHH))

    }

//** -------| Forecast Maximum and Minimum Temperature groups |--------------------


TemperatureGroup "1.3.5.1. Forecast Maximum and Minimum Temperature groups (T(X)(N)[M]TFTF/YYGFGFZ)"= 
    max: MaxTemp min: MinTemp {
        const [Tx, Dx, Hx] = max
        const [Tn, Dn, Hn] = min

        return {TX:max,TN:min}
    }

MaxTemp =
    __ "TX" tx:Temperature "/" utc:DateHourUTC "Z" {

        const dt = Date(2024,)
        return [tx, utc]
    }

MinTemp =
     __ "TN" tx:Temperature "/" utc:DateHourUTC "Z" {
         return [tx,utc]
     }

Temperature = 
    tt:("M"?[0-9][0-9]) { 
        const [minus, ...temp] = tt
        if(!!minus) tt = ['-',...temp]
        return Number(tt.join(""))
     }
    
    
`);
}

const becmg = `\
Becoming (BECMG)—The change-indicator group TTTTT YYGG/YYGeGe in\
the form of BECMG YYGG/YYGeGe is used to indicate a change to forecast prevailing\
conditions expected to occur at either a regular or irregular rate at an unspecified time\
within the period defined by a two-digit date (YY), two-digit change beginning time (GG)\
with a slash separating a two-digit date (YY) and a two-digit ending time (GeGe) in whole\
hours. The time-period described by a BECMG group is usually for one hour but never\
exceeds two hours. This change to the predominant conditions are followed by a\
description of all elements for which the change is forecast. The forecast conditions\
encoded after the BECMG YYGG/YYGeGe group are those elements expected to prevail\
from the ending time of this change group (GeGe) to the ending time of the forecast period`;
const text = { becmg };

export const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 9999 SKC QNH2902INS
BECMG 0716/0705 01015G17KT 9999 BKN020 BKN020 QNH2902INS
BECMG 0704/0705 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
export const parser = makeParser();
