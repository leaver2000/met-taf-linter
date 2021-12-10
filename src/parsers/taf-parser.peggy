

{

    function flattenSkyCondition(L1,L2) {
        if(!!L2) return [L1,L2.flat()]
        return [L1]
    }//Precipitation)? Obscuration? Vicinity
    function validateThunderstormForecast(skyCondition){
            var isLowestBrokenOrOvercastLayer = true
            skyCondition.forEach(([ccc,base,CBRemark])=>{

                // validate CB remark
                const isBrokenOrOvercast = ccc ==="BKN" | ccc ==="OVC"
                console.log(ccc)

                if(isBrokenOrOvercast && isLowestBrokenOrOvercastLayer){
                    isLowestBrokenOrOvercastLayer = false
                    if (!CBRemark) throw {
                        type: "SyntaxError",
                        message: 'a CB remark is required on the lowest broken or overcast layer',
                        found: location()
                    }

                } else if (isBrokenOrOvercast && !isLowestBrokenOrOvercastLayer){
                    if (CBRemark) throw {
                        type: "SyntaxError",
                        message: 'Only include the CB remark on the lowest borken or overcast layer',
                        found: location()
                    } 
                }
            })
    }
    function validateCondtions([Precipitation,Obscuration,Vicinity],{wind,visibility,weather,skyCondition}){
        let weatherConditions = [Obscuration,Vicinity]



        if(!!Precipitation){
            weatherConditions.push(Precipitation)
            const precipType = Precipitation.replace(/(\+|-)/,"")
            switch(precipType){
                case "TSRA":
                    validateThunderstormForecast(skyCondition)
                    break




                default:
                    return
            }

            // var isLowestBrokenOrOvercastLayer = true
            // skyCondition.forEach(([ccc,base,CBRemark])=>{
            //     // validate CB remark
            //     const isBrokenOrOvercast = ccc ==="BKN" | ccc ==="OVC"

            //     if(isBrokenOrOvercast && isLowestBrokenOrOvercastLayer){
            //         isLowestBrokenOrOvercastLayer = false
            //         if (!CBRemark) throw {
            //             type: "SyntaxError",
            //             message: 'a CB remark is required on the lowest broken or overcast layer',
            //             found: location()
            //         }

            //     }else if (isBrokenOrOvercast && !isLowestBrokenOrOvercastLayer){
            //         if (CBRemark) throw {
            //             type: "SyntaxError",
            //             message: 'Only include the CB remark on the lowest borken or overcast layer',
            //             found: location()
            //         } 
            //     }
            // })

        }
        // conds.forEach(c=>{
        //     if(!!c)weatherConditions.push(c)
        // })
        

        return weatherConditions

    }
    

  }
  
RUN = (MessageHeading Line) (BECMG_Group / TEMPO_Group)+ (TemperatureGroup) 

//** ------------------------------------------------------------
__ "Single White Space Indicator" = 
    [ \t\n\r ] 

_NL "New Line Indicator" = 
    [\n]


//** ------------------------------------------------------------

MessageHeading 'TAF Header' =
  "TAF" __  header:(ICAO TAFTimes){return header}

ICAO = @word:$[A-Z]+ &{ return options.icao.includes(word) }
    
//** -------------------------|   Line  |-----------------------------------

Line = 
    wind:WindGroup visibility:VisibilityGroup weather:WeatherGroup skyCondition:CloudObscurationGroup altsg:Altsg{
        const forecastedWX = validateCondtions(weather,{wind,visibility,weather,skyCondition}) 

        if(visibility<=9000 && forecastedWX.length === 0){
            throw {
                message:"\
                1.3.5. Visibility Group (VVVV). Forecast prevailing visibility in meters, rounded down to\
                the nearest reportable value from Table 1.1. Include weather and/or an obscuration (w’w’)\
                whenever visibility is forecast less than 9,999 meters. (T-0) If visibility alternates frequently\
                from one significant value to another, describe the situation with a TEMPO group; do not use\
                variable visibility remarks. Note: While a visibility of less than 9,999 meters requires a weather\
                and/or obscuration, weather such as precipitation does not require a restriction to visibility to\
                be reported in a forecast (e.g., 9999 –RA). In this case, the weather is significant because it is\
                occurring, not because it is restricting visibility.",
                found:location()
                }
        }



        return [wind, visibility, forecastedWX, skyCondition, altsg ]
    } 

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
     _NL "BECMG" becmgGroup:( BECMG_TimeRange Line ) {
         return { becmgGroup }
        }


BECMG_TimeRange "BECMG Group Valid Time" =
    __ startTime:( DD HH ) "/" endTime: ( DD HH ) {
        

        const start = new Date(Date.UTC(2021, 1, ...startTime))
        // console.log(start.getHours())
        const end = new Date(Date.UTC(2021, 1, ...endTime))
        return { start, end }
}


//** ------------------------------------------------------------

TEMPO_Group "\
Temporary (TEMPO)—The change-indicator group TTTTT YYGG/YYGeGe in\
the form of TEMPO YYGG/YYGeGe group is used to indicate temporary fluctuations to\
the forecast meteorological conditions.\
"= 
    _NL "TEMPO" ( TEMPO_TimeRange TEMPO_Line )


TEMPO_Line "Tempo Line" = 
    __ line :(  WeatherGroup )


TEMPO_TimeRange "TEMPO Group Valid Time" =
    __ startTime:( DD HH ) "/" endTime: ( DD HH ) {
    return {startTime,endTime}
}



//-----------------------| Turbulence group (5BhBhBhBtL)| -------------------------------------

//** ------------------------------------------------------------
TAFTimes "Issue & Valid Time Period DDHHMMZ DDHH/DDHH" =
    issued:TAF_IssueTime validPeriod:TAF_ValidPeriod { 
        return {...issued, validPeriod }
    }

TAF_IssueTime "TAF Issue Time" = 
    __ dateTime:( DD HH MM ) "Z" {
        const {year,day} = options
        // console.log(options)
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
    __ wx:(Mist / Fog / Smoke / VolcanicAsh / WidespreadDust / Sand / Haze / Spray ){return wx}

Mist = "BR"
Fog = "FG"
Smoke = "FU" 
VolcanicAsh = "VA"
WidespreadDust = wx:(("BL")?"DU"){return wx.join("")}
Sand ="SA"
Haze = "HZ"
Spray = "PY"

BR = __ wx:"BR" {return wx}

// OTHER




//** ----------------------| WIND GROUP |----------------------

WindGroup "1.3.4. Wind Group (dddffGfmfmKT). Surface wind direction, speed and gusts, if any." =
    __ 
    direction:( ddd:([0,1,2][0-9][0] / [3][0,1,2][0] / "VRB" ) { 
        if(ddd==="VRB") return ddd
        return ddd.join("")
    }) 
    speed:( Sustained / Gusting )  {

        if(direction ==="VRB" && Number(speed)>6){
            throw {
                message:'\
                    When wind speed will be more than 6 knots, do not use VRB for ddd \
                    unless the situation involves air-mass thunderstorm activity during which \
                    forecasting a prevailing wind direction with confidence is not possible. When it is \
                    possible to forecast the peak gust direction, but not the prevailing direction, \
                    encode the wind group as VRBffGfmfmKT and append the probable peak gust \
                    direction to remarks (e.g., GST DRCTN 250).',
                found: location()
                
            }

        }

         return [direction,...speed]
     }




Sustained =
    windSpeed:(ValidWinds) "KT" {return [windSpeed]}

Gusting "Wind Gusts" =
    ff:ValidWinds "G" fm:ValidWinds "KT" {
        const ws = Number(ff)
        const wg = Number(fm)
        if(ws>=wg) throw {
            message:"Forecast Gust Should be greater than Forecast Windspeeds",
            found: location()
            }
        return [ff, fm]
        // return (ws>=wg)
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
                throw {
                    message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental\
                            United States (OCONUS) locations based on the host-nation national\
                            practice.",
                    found: location()
                }
            } else if (!options.isConusLocation && vis === "5000") throw {
                message:"Note 1: Substitute 5000 meters for 4800 meters Outside the Continental\
                        United States (OCONUS) locations based on the host-nation national\
                        practice.",
                found: location()
            }

            return [Number(vis)] 
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
    
    