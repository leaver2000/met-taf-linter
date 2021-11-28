import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEG2RAD, getElevation, pressureFromElevation } from '../util/atmosphere';
import SkewController, { useD3, useController } from '../hooks/use-skewt';
import SkewBackground, { Isobars, Isotherms } from './background'
export function SkewMain({ data, gradient = 45 }) {

    const { state } = useController()
    const [loadState, setLoadState] = useState<null | string>(null)

    const {
        ref,
        state: {
            _styles: { margin },
            _isoTherms: { mid, range },
            _isoBars: { top, base },
            // _initialized,
            _loadState: { initialized, loaded, sized },
            // _loadRequest,
            _refs: { divMain },
        },

        setVariables,
        resize,
        setState
    } = useD3((divMain) => {
        // const _loadState = {initialized:setVariables(divMain)}
        setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, initialized: setVariables(divMain) } }))
    }, [data.length]);


    const [count, setCount] = useState(0)
    const shiftXAxis = useCallback(() => {
        // clipper.attr("x", -xOffset);
        // xAxisValues.attr("transform", `translate(${xOffset}, ${h-0.5} )`);
        // for (let p in lines) {
        //     lines[p].attr("transform",`translate(${xOffset},0)`);
        // };
        // dataAr.forEach(d=>{
        //     for (let p in d.lines){
        //         d.lines[p].attr("transform",`translate(${xOffset},0)`);
        //     }
        // })
        //  setCount(7) 
    }, [])
    useEffect(() => {
        //once all the elements are loaded, the resize function adjust the skewt to fit the window,
        if (loaded && !sized) {
            const sized = resize()
            setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, sized } }))
            setCount((count) => count + 1)
        }
        return () => {
            shiftXAxis();
        }
    }, [setState, loaded, resize, sized, shiftXAxis])



    return (<div ref={ref} className='skew-t' {...() => initialized?...props:null}>);
}