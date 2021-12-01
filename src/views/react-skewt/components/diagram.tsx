import { useEffect } from 'react';
import { useD3 } from '../hooks/use-skewt';
// import * as d3 from 'd3';
// import { useDraw } from '../hooks/use-draw';

export default function Diagram({ ...props }) {
    //P = pressure | T =temperature
    const { ref, state, draw } = useD3('diagram', (bgRef) => draw('background', bgRef), []);
    // const draw = useDraw(state);
    useEffect(() => {
        if (!!state.parameters) {
        }
    }, [state.parameters]);

    return <g className='skew-background' ref={ref} {...props} />;
}
