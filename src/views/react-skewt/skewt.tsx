// import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
// import { DEG2RAD, getElevation, pressureFromElevation } from './util/atmosphere';
import SkewController, { useD3, useController } from './hooks/use-skewt';
import SkewBackground from './components/background';
import Main from './components/main';
import JSONTree from 'react-json-tree';
import { sounding } from './data/sounding';
export default function SkewtLab() {

    const [styles, setStyles] = useState({
        stroke: {
            primary: 'blue',
            secondary: 'green'
        }
    })
    const onEvent = useMemo(() => ({
        click: () => { },
        focus: () => { },
        hover: () => { }
    }), [])
    return (
        <>
            <button onClick={() =>
                setStyles({
                    stroke: {
                        primary: 'blue',
                        secondary: 'green'
                    }
                })}>light</button>

            <button onClick={() =>
                setStyles({
                    stroke: {
                        primary: 'red',
                        secondary: 'black'
                    }
                })}>dark</button>

            <button onClick={() =>
                setStyles({
                    stroke: {
                        primary: 'lime',
                        secondary: 'orange'
                    }
                })}>monokai</button>
            <SkewController >
                <SkewMain data={sounding} options={{ styles, onEvent, gradient: 45 }} />
            </SkewController>
        </>
    );
}

function SkewMain({ data, options }) {
    const { state, setState } = useController();
    useEffect(() => setState(({ ...oldState }) => ({ ...oldState, data, options })), [setState, data, options])


    return (
        <>{JSON.stringify(state.options)}
            {/* <JSONTree hideRoot data={document} /> */}
            <JSONTree hideRoot data={state._styles} />
            <JSONTree hideRoot data={state} />
            {!!state.options ? <Main data={data}>
                <SVGSVGSkewt>
                    <SkewContainer data={data}>
                        <SkewBackground>
                            <Clipper />
                            {/* <Isobars />
                            <Isotherms /> */}
                        </SkewBackground>
                        <SkewWindbarbs data={data} />
                    </SkewContainer>
                </SVGSVGSkewt>
                <SkewClouds data={data} />
            </Main> : null}
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
    const {
        ref,
        state: { _styles },
    } = useD3('skewSVG', (skewSVG) => ({ _loadState: { loaded: true } }), []);

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

    return <svg ref={ref} width={width} height={height} className='skew-svg' {...props} />;
}

function SkewWindbarbs({ data }) {
    const { ref } = useD3(
        'skewWindbarbs',
        (skewWindbarbs) => {
            // return { _refs: { skewWindbarbs } };
        },
        [data.length]
    );

    return <g ref={ref} />;
}

function SkewContainer({ data, ...props }) {
    const handleD3 = useCallback((skewContainer) => { }, []);
    const { ref } = useD3('skewContainer', handleD3, []);

    return <g ref={ref} className='skew-container' {...props} />;
}

function SkewClouds({ data, ...props }) {
    // console.log(state);
    return (
        <div className='cloud-container'>
            <CloudCanvas />
            <CloudCanvas />
        </div>
    );
}
function CloudCanvas() {
    return <canvas className='cloud' style={{ width: 1, height: 200 }} />;
}
