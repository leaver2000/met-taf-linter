import { useEffect, useRef, useCallback, useState, useMemo, createContext, useContext } from 'react';
import * as d3 from 'd3';
// import { useDraw } from './use-draw';
import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators';
import { DEG2RAD, pressureFromElevation } from '../util/atmosphere';
// let x = d3.select('sa')
const makeIntialState = () => {
    // console.log(options);
    var altticks: number[] = [];
    for (let i = 0; i < 20000; i += 10000 / 3.28084) altticks.push(pressureFromElevation(i));
    //*pressure
    const top = 50;
    const base = 1050;
    const increment = -50;

    //*thermals
    const mid = 0;
    const range = 50;
    const dryAdiabticLapseRate = d3
        .scaleLinear()
        .domain([mid - range * 2, mid + range * 4])
        .ticks(36);

    // ? scales

    const ticks = d3.range(base, top - 50, -25);
    const _all = Array.from(dryAdiabticLapseRate, (dalrValue) => Array.from(ticks, () => dalrValue));





    return {
        T: {
            mid,
            range,
            skew: d3
                .scaleLinear()
                .domain([mid - range * 3, mid + range])
                .ticks(24),
        },
        P: {
            at11km: pressureFromElevation(11000),
            // ticks: d3.range(base, top - 50, -25),
            log: d3.range(base, top - 50, increment),
            lines: d3.range(base, top - 50, increment),
            increment,
            ticks,
            base,
            top,
        },
        _styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
        _loadState: { initialized: false, loaded: false, sized: false, background: false },
        _windBarbs: { size: 15 },
        _scales: {
            tangent: Math.tan(45 * DEG2RAD),
            r: d3.scaleLinear().range([0, 300]).domain([0, 150]),
        },
        _d3Refs: {
            // skewBackground: null
        },
        _all,
    };
};

export const useController = () => {
    const { state, setState } = useContext(Controller);
    // const {}
    return { state, setState };
};
// export const useController = { state, setState }=useContext(Controller)
// press: number, hght: number temp:number, dwpt:number, wdir: number, wspd: number

type SkewOptions = {
    fill: {
        background: string;
        foreground: string;
    };
    stroke: {
        primary: string;
        primaryAlt: string;
        secondary: string;
        secondaryAtl: string;
        accent: string;
    };
    gradient: number;

    // styles: CTXStyles;
    onEvent: { click: () => void; focus: () => void; hover: () => void };
};

export type SkewCTX = {
    // _styles:React.CSSProperties

    data: { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
    options: SkewOptions;
    P: { base: number; increment: number; top: number; at11km: number; log: number[]; ticks: number[]; lines: number[] };
    T: { mid: number; range: number; skew: number[] };
    parameters: { [key: string]: d3.Selection<SVGElement, {}, HTMLElement, any> };
    _all: number[][];
    _styles: {
        margin: { top: number; right: number; bottom: number; left: number };
        height: number;
        width: number;
        xOffset: number;
    };

    // _selc: { [key: string]: d3.Selection<any, unknown, null, undefined> };
    _d3Refs: {
        skewBackground: d3.Selection<any, unknown, null, undefined>;
        [key: string]: d3.Selection<any, unknown, null, undefined>;
    };
    _scales: {
        tangent: number;
        // linearSkewt: number[];
        // logPressure: number[];
        linearDomain: number[];
        x: d3.ScaleLinear<number, number, never>;
        y: d3.ScaleLogarithmic<number, number, never>; //
    };
    _loadState: { initialized: boolean; loaded: boolean; sized: boolean; background: boolean };
    // _loadRequest: string
};
type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

export function useD3(refKey: string, render: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps: React.DependencyList) {
    // statful CTX
    const { state, setState }: { state: SkewCTX; setState: setSkewCTX } = useController();
    // refs
    // const draw = useDraw(state);

    const ref: React.MutableRefObject<any> = useRef();
    // memo'd state for effects
    const {
        P,
        T,
        _d3Refs: { skewContainer, skewSVG },
        _styles: { margin, width, height },
        _loadState: { loaded },
    } = useMemo(() => state, [state]);

    // ! ...callbacks
    const initializeVariables = useCallback(
        (divMain) => {
            let width = parseInt(divMain.style('width'), 10) - 10;
            let height = width; //to fix
            width = width - margin.left - margin.right;
            height = width - margin.top - margin.bottom;
            const x = d3
                .scaleLinear()
                .range([-width / 2, width + width / 2])
                .domain([T.mid - T.range * 2, T.mid + T.range * 2]); //range is width*2
            const y = d3.scaleLog().range([0, height]).domain([P.top, P.base]);

            // const x0 = d3.axisBottom(x).tickSize(0).ticks(20);//.orient("bottom");
            // const y0 = d3.axisLeft(y).tickSize(0).tickValues(P.lines.filter(p => (p % 100 === 0 || p === 50 || p === 150))).tickFormat(d3.format(".0d"));//.orient("left");
            // const y1 = d3.axisRight(y).tickSize(5).tickValues(P.ticks);//.orient("right");
            // // y2 = d3.axisLeft(y).tickSize(2).tickValues(altticks);

            setState(({ _loadState, _scales, _styles, ...oldState }) => {
                return {
                    ...oldState,
                    _scales: { ..._scales, x, y },
                    _styles: { ..._styles, width, height },
                    _loadState: { ..._loadState, initialized: true },
                };
            });
            return true;
        },
        [T, P, margin, setState]
    );
    // const shiftXAxis = useCallback(() => {
    // 	// let xOffset = this.xOffset;
    // 	// this._d3Refs.clipper.attr('x', -xOffset);
    // 	// console.log(this._d3Refs.xAxisValues);
    // 	// this._d3Refs.xAxisValues.attr('transform', `translate(${xOffset}, ${this._styles.height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
    // 	// // console.log(this._d3Refs.xAxisValues, root);
    // 	// // let xAxe = d3.select(_this._xAxisValues)._group;
    // 	// // console.log(xAxe).attr('transform', `translate(${xOffset}, ${height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
    // 	// for (let p in this._lines) {
    // 	// 	this._lines[p].attr('transform', `translate(${xOffset},0)`);
    // 	// }
    // }, []);
    // shiftXAxisshiftXAxis
    // const draw = useCallback((type: string) => withDraw(type, state), [state]);
    const resize = useCallback(() => {
        // skewBackground.selectAll('*').remove();
        // setVariables(divMain);
        skewSVG.attr('width', width + margin.right + margin.left).attr('height', height + margin.top + margin.bottom);
        skewContainer.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        return true;
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
    }, [skewContainer, skewSVG, width, height, margin]);

    //? primary D3 callback render, called when new data is loaded
    //! NEEDS CALLBACK TO RESET STATE WHEN NEW CONTENT IS LOADED

    const handleD3Render = useCallback(() => {
        const d3Ref = d3.select(ref.current);
        //? render returns either a stateful object | [ null | void | undefined ]
        const newState = render(d3Ref);

        setState(({ _d3Refs, ...oldState }: SkewCTX) =>
            // ? with the spread operator the refKey is added to the _d3Refs
            !!newState
                ? { ...{ ...newState, ...oldState }, _d3Refs: { [refKey]: d3Ref, ..._d3Refs } } //
                : { ...oldState, _d3Refs: { [refKey]: d3Ref, ..._d3Refs } }
        );
    }, [ref, refKey, render, setState]);
    //! effects
    useEffect(() => (loaded ? window.addEventListener('resize', resize) : void 0), [loaded, resize]);

    // ! ignore typescript. only execute render when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => (!!render ? handleD3Render() : void 0), [...deps]);


    // export function useDraw({ P, T, _all, options: { stroke }, _styles: { height, width }, _scales: { x, y, tangent }, _d3Refs: { skewBackground }, parameters, ...state }) {
    //     // d3.LineGenerators
    //     const elrLine = useMemo(() => elrLineGenerator({ x, y }, P.base, tangent), [x, y, P.base, tangent]);
    //     const dalrLine = useMemo(() => dalrLineGenerator({ x, y }, P.log, P.base, tangent), [x, y, P, tangent]);
    //     const malrLine = useMemo(() => malrLineGenerator({ x, y }, P, tangent, false), [x, y, P, tangent]);
    //     const isohumeLine = useMemo(() => isohumeLineGenerator({ x, y }, P, tangent), [x, y, P, tangent]);
    const draw = useDraw2()


    return { ref, state, setState, draw, initializeVariables, resize };
}

function useDraw2() {
    const { state: { P, T, _all, options: { stroke }, _styles: { height, width }, _scales, _d3Refs: { skewBackground }, parameters, ...state }, setState }: { state: SkewCTX; setState: setSkewCTX } = useController();
    const elrLine = useMemo(() => elrLineGenerator(_scales, P.base), [_scales, P.base,]);
    const dalrLine = useMemo(() => dalrLineGenerator(_scales, P.log, P.base,), [_scales, P,]);
    const malrLine = useMemo(() => malrLineGenerator(_scales, P, false), [_scales, P,]);
    const isohumeLine = useMemo(() => isohumeLineGenerator(_scales, P), [_scales, P,]);

    const isotherms = useCallback((d3Ref) => {
        const strokeOpacity: [string, number] = ['stroke-opacity', 0.5];
        const clipPath: [string, string] = ['clip-path', 'url(#clipper)'];
        const fill: [string, string] = ['fill', 'none'];
        const { x, y, tangent } = _scales
        d3Ref
            .selectAll('isotherms')
            .data(T.skew)
            .enter()
            .append('line')
            .attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tangent)
            .attr('x2', (d: number) => x(d) - 0.5)
            .attr('y1', 0)
            .attr('y2', height)
            .attr(...clipPath)
            .attr(...strokeOpacity)
            .attr(...fill)
            // .attr('class', (t: number) => `isotherm-line${t === 0 ? ' zero' : ''}`)
            .attr('stroke', (d) => {
                // console.log(d);
                return stroke.primary;
            })
    }, [P, height, T, _scales, stroke])

    const draw = useCallback((type, ref) => {
        isotherms(ref)

    }, [isotherms])
    return draw
}






export function useC2() {
    const [state, setState] = useState(() => makeIntialState());
    return { state, setState };
}

const Controller: any = createContext(useC2);

export default function SkewtController(props) {
    const ctx = useC2();
    return <Controller.Provider value={ctx} {...props} />;
}
