import { useCallback, useEffect } from 'react';
import { useD3 } from '../hooks/use-skewt';
import { dewptLineGenerator, tempLineGenerator } from '../hooks/line-generators'
// state: {
//     options: { palette },
export default function Diagram({ ...props }) {
    //P = pressure | T =temperature
    const { ref, state: { d3Refs: { diagram }, data, scales, P, options: { palette } }, draw, } = useD3(
        'diagram', (d3Ref) => draw.all('background', d3Ref), []);

    const plot = useCallback((ref) => {

        var filteredData = data.filter(function (d) { return (d.temp > -1000 && d.dwpt > -1000); });
        const templineFx = tempLineGenerator(scales, P)
        const tempdewlineFx = dewptLineGenerator(scales, P)
        var skewtlines = [filteredData];
        let { stroke, fill, opacity } = palette.temperature
        const { stroke: dpStroke, fill: dpFill, opacity: dpOpacity } = palette.dewpoint

        ref
            .selectAll("templines")
            .data(skewtlines).enter().append("path")
            .attr('stroke-opacity', opacity)
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr("d", templineFx)
            .attr("clip-path", "url(#clipper)")

        ref.selectAll("tempdewlines")
            .data(skewtlines).enter().append("path")
            .attr("class", "dwpt")
            .attr('fill', dpFill)
            .attr('stroke-opacity', dpOpacity)
            .attr('stroke', dpStroke)
            .attr("d", templineFx)
            .attr("d", tempdewlineFx)
            .attr("clip-path", "url(#clipper)")

    }, [data, scales, P, palette.temperature, palette.dewpoint])

    useEffect(() => !!diagram ? plot(diagram) : void 0, [diagram, plot])

    return <g fill={palette.foreground} ref={ref} {...props} />;
}
