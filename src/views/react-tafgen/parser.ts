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

	return peggy.generate(`
    //** ------------------------------------------------------------
    
    RUN = START BECMG+ END
    
    //** ------------------------------------------------------------
    __ "Single White Space" = [ \\t\\n\\r]
    _NL "New Line Indicator" = [\\n]
    //** ------------------------------------------------------------
    //** ------------------------------------------------------------
    START =
        "TAF ${Icao}" BaseTime Line 
        
    BECMG = 
        (_NL "BECMG" BECMG_TIME Line)
    
    BECMG_TIME = __ DD HH "/" DD HH
    
    
    
    TEMPO = 
        (_NL "TEMPO")
    
    END = 
        MaxTemp MinTemp
    //** ------------------------------------------------------------
    BaseTime "Issue & Valid Time Range DDHHMMZ DDHH/DDHH" =
        IssueTime ValidRange
    
    
    IssueTime = __ DD HH MM "Z"
    
    ValidRange = __ DD HH "/" DD HH
    
    
    DD 'Day'= [0,1,2,3][0-9]
    HH 'Hour' = [0,1,2][0-9]
    MM 'Minute' =
        [0,1,2,3,4,5,6][0-9]
    
    
    //** ------------------------------------------------------------
    
    Line = 
         Winds Visibility CurrentWeather SkyCondition Altsg 
    
    
    //** ----------------------| WX |----------------------
    CurrentWeather "Current Weather"= 
        wx:WX  {return {currentWx:wx.map(v=>!!v?v.join(""):"")}}
    
    WX = 
        (__ Mods "RA" )? (__ Mods "SHRA")? (__ "BR" )? 
    
    Mods = 
        "" / "-" / "+"
    
    //** ----------------------| WINDS |----------------------
    Winds =
        dir:WindDir spd:WindSpeed {
            return {
                dir:Number(dir.join("")),
                spd:spd.join("")
        }}
    
    WindDir =
        __ [0,1,2,3][0-9][0]
    
    WindSpeed =
        [0-9][0-9]"KT" / [0-9][0-9]"G"[0-9][0-9]"KT"
    //** ----------------------| VISIBILITY |----------------------
        
    Visibility = 
        __ ReportableVisibility
    
    ReportableVisibility =
        ${reportableVisibility()} 
    
    //** ----------------------| SKY_CONDITION |----------------------
    SkyCondition =
        __ ClourCover CloudBase
    ClourCover = 
        "SCT" / "FEW" / "BKN" / "OVC" 
    
    CloudBase = 
        [0,1,2,3][0-9][0-9]
    
    
    //** ----------------------| ALTSG |----------------------
    Altsg =
        __ "QNH" ("29"/ "30") [0-9][0-9] "INS"
    
    
    
    //** ----------------------| END OF TAF |----------------------
    MaxTemp =
        (__ "TX" temp "/" time "Z")
    
    MinTemp =
        (__ "TN" temp "/" time "Z")
    
    temp = 
        [0-9][0-9]
    
    time =  
        [0-9][0-9][0-9][0-9]
    
    
    
    
    `);
}

const testTAF = `\
TAF KADW 070100Z 0701/0807 01015G25KT 9999 BKN020 QNH2902INS
BECMG 0704/0705 01015G25KT 9999 BKN020 QNH2902INS
BECMG 0704/0705 01015G25KT 9999 BKN020 QNH2902INS TX13/0421Z TN03/0508Z\
`;
const parser = makeParser('KADW', '070100Z');
try {
	const pVal = parser.parse(testTAF);

	console.log('PARSER PASSED');
	pVal.forEach((e) => console.log(e));
} catch (e) {
	console.log('PARSER FAILED');
	console.log(e);
}
