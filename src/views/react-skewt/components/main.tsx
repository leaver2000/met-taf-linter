import { useCallback, useEffect } from 'react';
import JSONTree from 'react-json-tree';
import { useD3 } from '../hooks/use-skewt';
export default function SkewMain(props) {
    // ?
    const {
        ref,
        draw,
        state: {
            options: { palette },
            data,

            _loadState: { initialized, loaded, sized },
            ...state
        },
        initializeVariables,
        resize,
        setState,
    } = useD3(
        'divMain',
        (divMain) =>
            setState(
                (
                    { _loadState, ...oldState } //
                ) => ({ ...oldState, _loadState: { ..._loadState, initialized: initializeVariables(divMain) } })
            ),
        []
    );

    // const backgroundColor = fill.background;
    const shiftXAxis = useCallback(() => {

    }, []);
    useEffect(() => {
        // * once all the elements are loaded, the resize function adjust the skewt to fit the window,
        if (loaded && !sized) {
            // const sized = resize();
            // setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, sized } }));
        }
        return () => {
            shiftXAxis();
        };
    }, [setState, loaded, resize, sized, shiftXAxis]);
    const style = {
        padding: '10px',
        backgroundColor: palette.background
    };



    return (
        <div style={style}>
            state:
            <JSONTree hideRoot data={state} />
            draw:
            <JSONTree hideRoot data={draw} />
            <div ref={ref} style={{ backgroundColor: palette.foreground }} {...(initialized ? props : [null])} />;
        </div>
    );
}
