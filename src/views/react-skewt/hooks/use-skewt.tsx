
import { useEffect, useRef, useCallback, useState, useMemo, createContext, useContext } from 'react';
import { select } from 'd3';
import * as d3 from 'd3';
import { DEG2RAD, getElevation, pressureFromElevation } from '../util/atmosphere';
// import SkewController, { useD3 } from './hooks/use-skewt';
// import * as atm from '../util/atmosphere';
const makeIntialState = (gradient) => {
    var altticks: number[] = [];
    for (let i = 0; i < 20000; i += 10000 / 3.28084) altticks.push(pressureFromElevation(i));
    //*pressure
    const top = 50;
    const base = 1050;
    const increment = -50;
    const _isoBars = {
        pAt11km: pressureFromElevation(11000),
        lines: d3.range(base, top - 50, increment),
        ticks: d3.range(base, top - 50, -25),
        steph: getElevation(top) / 30,
        top,
        base,
        increment,
        highlight: false,
    };
    //*thermals
    const mid = 0;
    const range = 50;
    const dryAdiabticLapseRate = d3
        .scaleLinear()
        .domain([mid - range * 2, mid + range * 4])
        .ticks(36);

    const _isoTherms = {
        bisectTemp: d3.bisector((d) => {
            console.log(d);
        }).left,
        dryAdiabticLapseRate,
        range,
        mid,
    };
    const _scales = {
        tangent: Math.tan((gradient || 55) * DEG2RAD),
        r: d3.scaleLinear().range([0, 300]).domain([0, 150]),
    };
    const _all = Array.from(dryAdiabticLapseRate, (dalrValue) => Array.from(_isoBars.ticks, () => dalrValue));
    const _buttons = {
        dryAdiabat: { highlight: false },
        moistAdiabat: { highlight: false },
        isohume: { highlight: false },
        isoTherms: { highlight: false },
        isoBars: { highlight: false },
    };
    return {
        _styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
        _loadState: { initialized: false, request: 'resize', loaded: false },
        _windBarbs: { size: 15 },
        // _initialized: false,
        _refs: {},
        _scales,
        _isoTherms,
        _isoBars,
        _buttons,
        _all,
        // _scale:
    };
};
export function useController() {
    const { state, setState } = useContext(Controller);
    return { state, setState }
}

type SkewCTX = {
    // _styles:React.CSSProperties 
    _styles: {
        margin: { top: number, right: number, bottom: number, left: number },
        height: number, width: number, xOffset: number
    },
    _isoTherms: { mid: number, range: number },
    _isoBars: { top: number, base: number, highlight: boolean, lines: number[], pAt11km: number },
    _selc: { [key: string]: d3.Selection<any, unknown, null, undefined> }
    _refs: { [key: string]: d3.Selection<any, unknown, null, undefined> }
    _scales: { y: any, x: any, tangent: number }
    _loadState: { initialized: boolean, request: string, loaded: boolean, sized: boolean }
    // _loadRequest: string

}
type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>

export function useD3(render: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps: React.DependencyList) {
    const { state, setState }: { state: SkewCTX, setState: setSkewCTX } = useController()

    const ref: React.MutableRefObject<any> = useRef();

    const {
        _refs: {
            skewBackground,
            skewContainer,
            divMain,
            skewSVG },
        _styles: { margin, width, height },
        _isoTherms: { mid, range },
        _isoBars: { top, base },
        // _initialized,
    } = useMemo(() => state, [state])

    const setVariables = useCallback((divMain) => {
        try {

            let width = parseInt(divMain.style('width'), 10) - 10;
            let height = width; //to fix
            width = width - margin.left - margin.right;
            height = width - margin.top - margin.bottom;
            const x = d3
                .scaleLinear()
                .range([-width / 2, width + width / 2])
                .domain([mid - range * 2, mid + range * 2]); //range is width*2
            const y = d3.scaleLog().range([0, height]).domain([top, base]);

            setState(({ _refs, _scales, _styles, ...oldState }) => ({
                ...oldState,
                _refs: { ..._refs, divMain },
                _scales: { ..._scales, x, y },
                _styles: { ..._styles, width, height }
            }))
            return true
        } catch (err) { return false }


    }, [base, margin, mid, range, top, setState])
    const resize = useCallback(() => {
        skewBackground.selectAll("*").remove();
        setVariables(divMain);
        skewSVG.attr("width", width + margin.right + margin.left).attr("height", height + margin.top + margin.bottom);
        skewContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        return true
        // drawBackground();
        // dataAr.forEach(d=> {
        //     plot(d.data,{add:true, select:false});
        // } );//redraw each plot
        // if(selectedSkewt) selectSkewt(selectedSkewt.data);
        // shiftXAxis();
        // tooltipRect.attr("width", w).attr("height", h);

        // cloudContainer.style("left", (margin.left+2) +"px").style("top", margin.top+"px").style("height", h+"px");
        // let canTop=y(100);  //top of canvas for pressure 100
        // cloudCanvas1.style("left","0px").style( "top",canTop+"px").style("height",(h-canTop)+"px");
        // cloudCanvas2.style("left","10px").style("top",canTop+"px").style("height",(h-canTop)+"px");
        // }
    }, [skewBackground, skewSVG, divMain, setVariables, width, height, margin])




    useEffect(() => {
        if (!!render) {
            const newState = render(select(ref.current))
            !!newState ? setState((oldState: SkewCTX) =>
                Object.keys(newState).reduce((memo, k) => {
                    // return recursivelySetStateObject(memo, oldState, k)

                    if (typeof newState[k] === 'object')
                        return { ...memo, ...{ [k]: { ...memo[k], ...newState[k] } } }
                    else
                        return { ...memo, ...{ [k]: newState[k] } }


                }, oldState)
            ) : void 0

        } else {

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [render, ...deps]);
    return { ref, state, setState, setVariables, resize }

}
// function recursivelySetStateObject(memo: any, newState: any, k: any) {
//     let b = newState[k]
//     if (typeof newState[k] === 'object')
//         return { ...memo, ...{ [k]: { ...memo[k], ...newState[k] } } }
//     else
//         return { ...memo, ...{ [k]: newState[k] } }
//     //     if (typeof newState[k] === 'object')
//     //     return { ...memo, ...{ [k]: { ...memo[k], ...newState[k] } } }
//     // else
//     //     return { ...memo, ...{ [k]: newState[k] } }


// }
function useC2() {
    const [state, setState] = useState(() => makeIntialState(45))
    return { state, setState };
}
const Controller: any = createContext(useC2);


export default function SkewtController(props: any) {
    const ctx = useC2();
    return <Controller.Provider value={ctx} {...props} />;
}
