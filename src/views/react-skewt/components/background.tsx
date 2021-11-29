import { useCallback, useMemo, useEffect } from 'react';
import { elrLineGenerator, dalrLineGenerator, malrLineGenerator, isohumeLineGenerator } from './line-generators'
import { useD3 } from '../hooks/use-skewt';

export default function Background({ ...props }) {
    //P = pressure | T =temperature
    const {
        ref,
        state: { P, T, _all, _loadState, _styles: { height, width }, _scales: { x, y, tangent }, _refs: { skewBackground } },
        setState,//
    } = useD3('skewBackground', (skewBackground) => draw_Background(skewBackground), []);

    // setState backgroundLines, callback
    const setLineToState = useCallback((line) => (setState(({ _backgroundLines, ...oldState }) => //
        ({ _backgroundLines: { ...line, ..._backgroundLines }, ...oldState }))), [setState])

    // Linear Skewed Tempature Lines (SKEWT): Draw Callback
    const draw_Isotherms = useCallback((skewBackground) => {
        const isotherms = skewBackground.selectAll('isotherms')
            .data(T.skew)
            .enter()
            .append('line')
            .attr('x1', (d: number) => x(d) - 0.5 + (y(P.base) - y(P.top)) / tangent)
            .attr('x2', (d: number) => x(d) - 0.5)
            .attr('y1', 0)
            .attr('y2', height)
            .attr("clip-path", "url(#clipper)")
            .attr('class', (t: number) => `isotherm-line${(t === 0 ? ' zero' : '')}`)

        setLineToState({ isotherms })
    }, [setLineToState, P, T.skew, tangent, x, y, height])

    // Logarithmic Pressure Lines (LOGP): Draw Callback
    const draw_Isobars = useCallback((skewBackground) => {
        const isobars = skewBackground.selectAll("isobars")
            .data(P.log)
            .enter().append("line")
            .attr("x1", - width)
            .attr("x2", 2 * width)
            .attr("y1", y)
            .attr("y2", y)
            .attr("clip-path", "url(#clipper)")
            .attr("class", 'isobar-line');

        setLineToState({ isobars })
    }, [width, P.log, y, setLineToState])

    // Environmental Lapse Rate (ELR): LineGenerator and Draw Callback
    const elrLine = useMemo(() => elrLineGenerator({ x, y }, P.base, tangent), [x, y, P.base, tangent])
    const draw_EnvironmentalLapseRate = useCallback((skewBackground) => {
        const envLapseRate = skewBackground.selectAll("envLapseRate")
            .data([P.log.filter(p => p > P.at11km).concat([P.at11km, 50])])
            .enter().append("path")
            .attr("d", elrLine)
            .attr("clip-path", "url(#clipper)")
            .attr("class", `elr-line`);

        setLineToState({ envLapseRate })

    }, [elrLine, P, setLineToState])

    // Dry Adiabtic Lapse Rate (DALR): LineGenerator and Draw Callback
    const dalrLine = useMemo(() => dalrLineGenerator({ x, y }, P.log, P.base, tangent), [x, y, P, tangent])
    const draw_DryAdiabticLapseRate = useCallback((skewBackground) => {
        const dryAdiabaticLapseRate = skewBackground.selectAll("DALR")
            .data(_all)
            .enter().append("path")
            .attr("class", 'dalr-line')
            .attr("clip-path", "url(#clipper)")
            .attr("d", dalrLine);
        setLineToState({ dryAdiabaticLapseRate })

    }, [dalrLine, _all, setLineToState])

    // Moist Adiabtic Lapse Rate (MALR): LineGenerator and Draw Callback
    //! NOT WORKING
    const malrLine = useMemo(() => malrLineGenerator({ x, y }, P, tangent, true), [x, y, P, tangent])
    const draw_MoistAdiabticLapseRate = useCallback((skewBackground) => {
        const moistAdiabaticLapseRate = skewBackground.selectAll("MALR")
            .data(_all)
            .enter().append("path")
            .attr("class", 'malr-line')
            .attr("clip-path", "url(#clipper)")
            .attr("d", malrLine);
        setLineToState({ moistAdiabaticLapseRate })

    }, [setLineToState, _all, malrLine])

    const isohumeLine = useMemo(() => isohumeLineGenerator({ x, y }, P, tangent), [x, y, P, tangent])
    const draw_Isohumes = useCallback((skewBackground) => {
        skewBackground.selectAll("isohumeline")
            .data(_all)
            .enter().append("path")
            .attr("class", 'isohume-line')
            .attr("clip-path", "url(#clipper)")
            .attr("d", isohumeLine);
    }, [isohumeLine, _all])

    //  DRAW GRID LINES
    const draw_GridLines = useCallback((skewBackground) => {
        const gridLines = skewBackground.append("line")
            .attr("x1", width - 0.5)
            .attr("x2", width - 0.5)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("class", "gridline");
        setLineToState({ gridLines })

    }, [height, width, setLineToState])

    // DRAW ALL BACKGROUND LINES
    const draw_Background = useCallback((skewBackground) => {
        draw_Isotherms(skewBackground)
        draw_Isobars(skewBackground)
        draw_EnvironmentalLapseRate(skewBackground)
        draw_DryAdiabticLapseRate(skewBackground)
        draw_MoistAdiabticLapseRate(skewBackground)
        draw_GridLines(skewBackground)
        draw_Isohumes(skewBackground)
        setState(({ _loadState, ...oldState }) => ({ _loadState: { ..._loadState, background: true }, ...oldState }))
    }, [//
        setState,
        draw_Isobars,
        draw_Isohumes,
        draw_GridLines,
        draw_Isotherms,
        draw_DryAdiabticLapseRate,
        draw_EnvironmentalLapseRate,
        draw_MoistAdiabticLapseRate,
    ])
    console.log(skewBackground)
    useEffect(() => {
        // if (!_loadState.background){
        // let x = skewBackground

        // }

    }, [_loadState.background,])

    return <g className='skew-background' ref={ref} {...props} />;
}
