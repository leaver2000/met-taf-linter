import { useState, createContext, useContext } from 'react';
import * as d3 from 'd3';
import { DEG2RAD, pressureFromElevation } from '../hooks/atmosphere';

function useC2() {
    const [state, setState] = useState(() => makeIntialState());
    console.log(state);
    return { state, setState };
}

export const useController = () => {
    const { state, setState } = useContext(Context);
    return { state, setState };
};

export function Command(props) {
    const ctx = useC2();
    return <Context.Provider value={ctx} {...props} />;
}

const makeIntialState = () => {

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
    const skewT = d3
        .scaleLinear()
        .domain([mid - range * 3, mid + range])
        .ticks(24);
    const logP = d3.range(base, top - 50, increment);

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
            log: d3.range(base, top - 50, increment),
            lines: d3.range(base, top - 50, increment),
            increment,
            ticks,
            base,
            top,
        },
        lineGen: { skewT, logP },
        _styles: { xOffset: 0, margin: { top: 30, right: 40, bottom: 20, left: 35 } },
        _loadState: { initialized: false, loaded: false, sized: false, background: false },
        _windBarbs: { size: 15 },
        scales: {
            tan: Math.tan(45 * DEG2RAD),
            // r: d3.scaleLinear().range([0, 300]).domain([0, 150]),
        },
        d3Refs: {
            // skewBackground: null
        },
        _all,
    };
};
const Context: any = createContext(useC2);
export default Context;
