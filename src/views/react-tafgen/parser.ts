import * as peggy from 'peggy';

function makeParser(Icao: string, baseTime: string, isConusLocation: boolean = true) {
    console.log(baseTime);
    const reportableVisibility = () =>
        ////////////////////////////////
        `"${[
            //
            ...['0000', '0100', '0200', '0300', '0400', '0600', '0700', '0800', '0900'], //0000-0999
            ...['1000', '1100', '1200', '1200', '1400', '1500', '1600', '1700', '1800'], //1000-1999
            ...['2000', '2200', '2400', '2600', '2800', '3000', '3200', '3400', '3600', '3700'], //2000-3999
            ...['4000', '4400', '4500', '4700', `${isConusLocation ? '5000' : '4800'}`],
            ...['6000', '7000', '8000', '9000', '9999'],
        ].join('" / "')}"`;
    // ''.slice(1)
    return peggy.generate(`
//** ------------------------------------------------------------
{{
    function makeInteger(o) {
      return parseInt(o.join(""), 10);
    }
  }}
  
  {
    if (options.multiplier) {
      input = "(" + input + ")*(" + options.multiplier + ")";
    }
  }
  
RUN = MessageHeading IntermediateLines+  TemperatureGroup 

//** ------------------------------------------------------------
__ "Single White Space Indicator" = 
    [ \\t\\n\\r] 

_NL "New Line Indicator" = 
    [\\n]
//** ------------------------------------------------------------

IntermediateLines =
    BECMG_Group / TEMPO_Group


//** ------------------------------------------------------------

MessageHeading =
  "TAF ${Icao}" TAFTimes Line


    

//** ------------------------|  BECMG   |------------------------------------    
BECMG_Group "BECMG Group" = 
     _NL "BECMG" becmgGroup:( BECMG_TimeRange Line ) {
         return { becmgGroup }
        }


BECMG_TimeRange "BECMG Group Valid Time" =
    __ startTime:( DD HH ) "/" endTime: ( DD HH ) {

    return {startTime,endTime}
}


//** ------------------------------------------------------------

TEMPO_Group "Tempo Group"= 
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
    WindGroup VisibilityGroup CurrentWeather SkyCondition Altsg 


//** ----------------------| WX |----------------------
CurrentWeather "Current Weather"= 
    wx:WX  {return {currentWx:wx.map(v=>!!v?v.join(""):"")}}

WX = 
    (__ Mods "RA" )? (__ Mods "SHRA")? (__ "BR" )? 

Mods = 
    "" / "-" / "+"

//** ----------------------| WINDS |----------------------
// direction:WindDirection speed:( SustainedWinds / GustingWinds )  {
WindGroup "Wind Group (dddffGfmfmKT)"=
    __ 
    direction:(ddd:([0,1,2][0-9][0] / [3][0,1,2][0] / "VRB") { 
        if(ddd==="VRB") return ddd

        return ddd.join("")
    }) 
    speed:( SustainedWinds / GustingWinds )  {

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

         return {wind:[direction,...speed]}
     }


WindDirection =
    __ ddd:([0,1,2][0-9][0] / [3][0,1,2][0] / "VRB") { 
        return ddd

    }


    

SustainedWinds =
    windSpeed:(ValidWinds) "KT" {return [windSpeed]}

GustingWinds "Wind Gusts" =
    ff:ValidWinds "G" fm:ValidWinds "KT" {
        const ws = Number(ff)
        const wg = Number(fm)
        if(ws>=wg) throw Error("Forecast Gust Should be greater than Forecast Windspeeds")
        return [ff, fm]
    }

// VairableWinds =
// vrb:("VRB" ValidWinds){return [vrb]}


ValidWinds =
     wind:([0-9][0-9]) {return wind.join("")}



//** ----------------------| VISIBILITY |----------------------
    
VisibilityGroup "Visibility Group (VVVV)" = 
    (__ ReportableVisibility) {return }

ReportableVisibility =
    vis:(${reportableVisibility()}) ${submit('Number(vis)')}

//** ----------------------| SKY_CONDITION |----------------------


SkyCondition =
     sc:(SkyCon+ / SKC ) { return sc.join("") }

SkyCon = __(ClourCover CloudBase)

SKC = ( __ "SKC" )

ClourCover = 
    ("SCT" / "FEW" / "BKN" / "OVC" )

CloudBase = 
    cb:([0,1,2,3][0-9][0-9]) {return cb.join("")}


//** ----------------------| ALTSG |----------------------
Altsg =
   ( __ "QNH" ("29"/ "30") [0-9][0-9] "INS")


DateHourUTC = 
endTime:(DD HH) {
        return new Date(Date.UTC(2021,1, ...endTime))//.getHours()
    }
//** -------| Forecast Maximum and Minimum Temperature groups |--------------------


TemperatureGroup "1.3.5.1. Forecast Maximum and Minimum Temperature groups (T(X)(N)[M]TFTF/YYGFGFZ)"= 
    max: MaxTemp min: MinTemp {
        const [Tx, Dx, Hx] = max
        const [Tn, Dn, Hn] = min



        return {TX:max,TN:min}
    }

MaxTemp =
    __ "TX" tx:Temperature "/" vt:DateHourUTC "Z" {
        // const [dd]
        const dt = Date(2024,)
        return [tx, ...vt]
    }

MinTemp =
     __ "TN" tx:Temperature "/" vt:DateHourUTC "Z" {
         return [tx,...vt]
     }

Temperature = 
    tt:("M"?[0-9][0-9]) { 
        const [minus, ...temp] = tt
        if(!!minus) tt = ['-',...temp]
        return Number(tt.join(""))
     }
    

    
    
`);
}

function submit(x) {

    return `{return ${x}}`
}





export const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 9999 SKC QNH2902INS
BECMG 0716/0705 01015G17KT 9999 BKN020 BKN020 QNH2902INS
BECMG 0704/0705 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
export const parser = makeParser('KADW', '070100Z');


