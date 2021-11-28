// import { useCallback, useEffect } from 'react';
// import { SVGGElement } from './elements';
import * as d3 from 'd3';
import { getElevation, } from '../util/atmosphere';//DEG2RAD//getElevation2
import { useD3 } from '../hooks/use-skewt';

export default function Background({ data, ...props }) {


    const { ref, state: {
        _isoTherms,
        _isoBars,
        _styles: { height, margin },
        _scales,
        _refs
    }, setState } = useD3((skewBackground) => {
        skewBackground
            .selectAll('templine')
            .data(
                d3
                    .scaleLinear()
                    .domain([_isoTherms.mid - _isoTherms.range * 3, _isoTherms.mid + _isoTherms.range])
                    .ticks(24)
            )
            .enter()
            .append('line')
            .attr('x1', (d: number) => _scales.x(d) - 0.5 + (_scales.y(_isoBars.base) - _scales.y(_isoBars.top)) / _scales.tangent)
            .attr('x2', (d: number) => _scales.x(d) - 0.5)
            .attr('y1', 0)
            .attr('y2', height)
        // .attr('class', (d: number) => (d === 0 ? `tempzero ${!_isoBars.highlight ? 'highlight-line' : ''}` : `templine ${!_isoBars.highlight ? 'highlight-line' : ''}`))
        //     .attr('clip-path', 'url(#clipper)');

        // var elrFx = d3
        //     .line()
        //     .curve(d3.curveLinear)
        //     .x((d, i) => {
        //         // let e = getElevation2(d);
        //         let t = Number(d) > _isoBars.pAt11km ? 15 - getElevation(d) * 0.00649 : -56.5; //6.49 deg per 1000 m
        //         return _scales.x(t) + (_scales.y(_isoBars.base) - _scales.y(d)) / _scales.tangent;
        //     })
        //     .y((d, i) => _scales.y(d));
        //?Environmental Lapse Rate (ELR)
        // skewBackground
        //     .selectAll('elr')
        //     .data([_isoBars.lines.filter((p: number) => p > _isoBars.pAt11km).concat([_isoBars.pAt11km, 50])])
        //     .enter()
        //     .append('path')
        //     .attr('d', elrFx)
        //     .attr('clip-path', 'url(#clipper)')
        //     .attr('class', `elr ${true ? 'highlight-line' : ''}`);

        return { _refs: { skewBackground } }
    }, [data.length]);
    return (
        <g ref={ref} {...props} />
    )
}

export function Isobars() {
    const { ref, state: {
        _isoTherms,
        _isoBars,
        _styles: { height, width, margin },
        _scales: { y },
        // _scales,
        _refs
    }, setState } = useD3((lineIsobar) => {
        lineIsobar.selectAll("lineIsobar").data(_isoBars.lines)
            // .enter().append("line")
            .attr("x1", - width)
            .attr("x2", 2 * width)
            .attr("y1", y)
            .attr("y2", y)
            .attr("clip-path", "url(#clipper)")
            .attr("class", `pressure ${_isoBars.highlight ? "highlight-line" : ""}`);
        return { _refs: { lineIsobar } }

    }, [])
    return <line ref={ref} />
}



export function Isotherms() {
    const { ref, state: {
        _isoTherms,
        _isoBars,
        _styles: { height, width, margin },
        _scales: { y },
        // _scales,
        _refs
    }, setState } = useD3((lineIsotherm) => {
        lineIsotherm.selectAll("lineIsobar").data(_isoBars.lines)
            // .enter().append("line")
            .attr("x1", - width)
            .attr("x2", 2 * width)
            .attr("y1", y)
            .attr("y2", y)
            .attr("clip-path", "url(#clipper)")
            .attr("class", `pressure ${_isoBars.highlight ? "highlight-line" : ""}`);
        return { _refs: { lineIsotherm } }

    }, [])
    return <line ref={ref} />
}






// d3.ScaleLogarithmic<number, number, never>
// d3.ScaleLinear<number, number, never>
//     data,
// state: {
//     _initialized,
//         _isoTherms,
//         _isoBars,
//         _styles: { height, margin },
//     _scales,
//         _refs
// },
//     setState,
// }) {

//     const withD3 = useCallback(
//         (skewBackground) => {
// skewBackground
//     .selectAll('templine')
//     .data(
//         d3
//             .scaleLinear()
//             .domain([_isoTherms.mid - _isoTherms.range * 3, _isoTherms.mid + _isoTherms.range])
//             .ticks(24)
//     )
//     .enter()
//     .append('line')
//     .attr('x1', (d: number) => _scales.x(d) - 0.5 + (_scales.y(_isoBars.base) - _scales.y(_isoBars.top)) / _scales.tangent)
//     .attr('x2', (d: number) => _scales.x(d) - 0.5)
//     .attr('y1', 0)
//     .attr('y2', height)
//     .attr('class', (d: number) => (d === 0 ? `tempzero ${_isoBars.highlight ? 'highlight-line' : ''}` : `templine ${_isoBars.hightlight ? 'highlight-line' : ''}`))
//     .attr('clip-path', 'url(#clipper)');

// var elrFx = d3
//     .line()
//     .curve(d3.curveLinear)
//     .x((d, i) => {
//         // let e = getElevation2(d);
//         let t = Number(d) > _isoBars.pAt11km ? 15 - getElevation(d) * 0.00649 : -56.5; //6.49 deg per 1000 m
//         return _scales.x(t) + (_scales.y(_isoBars.base) - _scales.y(d)) / _scales.tangent;
//     })
//     .y((d, i) => _scales.y(d));
// //?Environmental Lapse Rate (ELR)
// skewBackground
//     .selectAll('elr')
//     .data([_isoBars.lines.filter((p: number) => p > _isoBars.pAt11km).concat([_isoBars.pAt11km, 50])])
//     .enter()
//     .append('path')
//     .attr('d', elrFx)
//     .attr('clip-path', 'url(#clipper)')
//     .attr('class', `elr ${true ? 'highlight-line' : ''}`);

//             setState(({ _refs, ...oldState }) => ({ ...oldState, _refs: { ..._refs, skewBackground } }));
//         },

//         [_isoTherms, _isoBars, height, _scales, setState]
//     );
//     const resize = useCallback((e) => {
//         _refs.skewBackground.selectAll("*").remove();
//         // setVariables();
//         // svg.attr("width", w + margin.right + margin.left).attr("height", h + margin.top + margin.bottom);
//         _refs.skewContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//         // drawBackground();
//         // dataAr.forEach(d=> {
//         //     plot(d.data,{add:true, select:false});
//         // } );//redraw each plot
//         // if(selectedSkewt) selectSkewt(selectedSkewt.data);
//         // shiftXAxis();
//         // tooltipRect.attr("width", w).attr("height", h);

//         // cloudContainer.style("left", (margin.left+2) +"px").style("top", margin.top+"px").style("height", h+"px");
//         // let canTop=y(100);  //top of canvas for pressure 100
//         // cloudCanvas1.style("left","0px").style( "top",canTop+"px").style("height",(h-canTop)+"px");
//         // cloudCanvas2.style("left","10px").style("top",canTop+"px").style("height",(h-canTop)+"px");
//     }, [_refs, margin])
//     useEffect(() => {
//         if (!!_refs.skewBackground) {
//             resize(null)
//             window.addEventListener('resize', resize)
//         }
//         return () => { }
//     }, [resize, _refs.skewBackground])
//     // const ref = useD3(withD3, [data.length]);

//     // useEffect(()=>{
//     // 	ref.selectAll('*').remove()
//     // },[])
//     // return <g ref={ref} {...props} />;

//     return <SVGGElement className='windbarb' withD3={withD3} data={data} />;
// }

// // function Clip(){
// // 	return <clipPath />
// // }
export { }