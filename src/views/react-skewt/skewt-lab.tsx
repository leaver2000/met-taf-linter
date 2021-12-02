import { useEffect, useMemo } from 'react';
import { useD3 } from './hooks/use-skewt';
import Diagram from './components/diagram';
import Main from './components/main';
import { Command, useController } from './controller/c2';


const SkewtLab = ({ data, options }) => (
    <Command>
        <Control data={data} options={options} />
    </Command>
)
export default SkewtLab


function Control({ data, options }) {
    const { state, setState } = useController();
    useEffect(() => setState(({ ...oldState }) => ({ ...oldState, options, data })), [setState, data, options]);
    return (
        <>
            {JSON.stringify(state.options)}
            {!!state.options && state.data ? (
                <Main data={data}>
                    <SVGSVGSkewt>
                        <Diagram>
                            <Clipper />
                        </Diagram>
                    </SVGSVGSkewt>
                </Main>
            ) : null}
        </>
    );
}
function Clipper() {
    // const clipper = skewBackground.append('clipPath').attr('id', 'clipper').append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
    const {
        ref,
        state: {
            _styles: { width, height },
        },
    } = useD3('clipper', (clipper) => ({}), []);
    return (
        <clipPath ref={ref} className='clipper' id='clipper'>
            <rect width={width} height={height}></rect>
        </clipPath>
    );
}

function SVGSVGSkewt({ ...props }) {
    const { ref, state: { _styles } } = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

    const [width, height] = useMemo(() => {
        const {
            margin: { top, right, left, bottom },
            width,
            height,
        } = _styles;
        const w = width + right + left;
        const h = height + top + bottom;
        return [w, h];
    }, [_styles]);

    return <svg ref={ref} fill='green' width={width} height={height} className='skew-svg' {...props} />
}



