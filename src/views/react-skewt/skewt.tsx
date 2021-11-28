import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEG2RAD, getElevation, pressureFromElevation } from './util/atmosphere';
import SkewController, { useD3, useController } from './hooks/use-skewt';
import SkewBackground, { Isobars, Isotherms } from './components/background';
import Main from './components/main'
// import { SVGGElement, SVGRectElement } from './components/elements';
import JSONTree from 'react-json-tree';
// import {useCTX} from
export default function SkewtLab({ data }: { data: { [key: string]: number }[] }) {
    return (
        <SkewController>
            <SkewMain data={data} />
        </SkewController>
    );
}
function SkewMain({ data }) {
    const { state } = useController()

    return (

        <>
            <JSONTree hideRoot data={state._styles} />
            <JSONTree hideRoot data={state} />
            <Main >
                <SkewSVG data={data} />
                <SkewClouds data={data} />
            </Main>
        </>
    )
}

// function useDynamicCallbacks() {
// 	const resize = useCallback(() => {}, []);
// 	const shiftXAxis = useCallback(({ xOffset, _lines, _refs, _styles }) => {
// 		// let xOffset = this.xOffset;
// 		_refs.clipper.attr('x', -xOffset);
// 		// console.log(this._refs.xAxisValues);
// 		_refs.xAxisValues.attr('transform', `translate(${xOffset}, ${_styles.height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
// 		// console.log(this._refs.xAxisValues, root);
// 		// let xAxe = d3.select(_this._xAxisValues)._group;
// 		// console.log(xAxe).attr('transform', `translate(${xOffset}, ${height - 0.5} )`); //.attr('transform', `translate(${xOffset}, ${height - 0.5} )`);
// 		for (let p in _lines) {
// 			_lines[p].attr('transform', `translate(${xOffset},0)`);
// 		}
// 		// dataAr.forEach((d) => {
// 		// 	for (let p in d.lines) {
// 		// 		d.lines[p].attr('transform', `translate(${xOffset},0)`);
// 		// 	}
// 		// });
// 	}, []);

// 	return { resize, shiftXAxis };
// }

// function SkewMain({ data, gradient = 45 }) {

//     const { state } = useController()
//     const [loadState, setLoadState] = useState<null | string>(null)

//     const {
//         ref,
//         state: {
//             _styles: { margin },
//             _isoTherms: { mid, range },
//             _isoBars: { top, base },
//             // _initialized,
//             _loadState: { initialized, loaded, sized },
//             // _loadRequest,
//             _refs: { divMain },
//         },

//         setVariables,
//         resize,
//         setState
//     } = useD3((divMain) => {
//         // const _loadState = {initialized:setVariables(divMain)}
//         setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, initialized: setVariables(divMain) } }))
//     }, [data.length]);


//     const [count, setCount] = useState(0)
//     const shiftXAxis = useCallback(() => {
//         // clipper.attr("x", -xOffset);
//         // xAxisValues.attr("transform", `translate(${xOffset}, ${h-0.5} )`);
//         // for (let p in lines) {
//         //     lines[p].attr("transform",`translate(${xOffset},0)`);
//         // };
//         // dataAr.forEach(d=>{
//         //     for (let p in d.lines){
//         //         d.lines[p].attr("transform",`translate(${xOffset},0)`);
//         //     }
//         // })
//         //  setCount(7) 
//     }, [])
//     useEffect(() => {
//         //once all the elements are loaded, the resize function adjust the skewt to fit the window,
//         if (loaded && !sized) {
//             const sized = resize()
//             setState(({ _loadState, ...oldState }) => ({ ...oldState, _loadState: { ..._loadState, sized } }))
//             setCount((count) => count + 1)
//         }
//         return () => {
//             shiftXAxis();
//         }
//     }, [setState, loaded, resize, sized, shiftXAxis])



//     return (
//         <><JSONTree hideRoot data={state._styles} />
//             <JSONTree hideRoot data={state} />{`count: ${count}`}
//             <div ref={ref} className='skew-t'>
//                 {initialized ? (
//                     <>
//                         <SkewSVG data={data} />
//                         <SkewClouds data={data} />
//                     </>
//                 ) : null}
//             </div>
//         </>
//     );
// }
function SkewSVG({ data }) {

    const { ref, state, setState } = useD3((skewSVG) => {
        return { _refs: { skewSVG }, _loadState: { loaded: true } }
    }, [data.length]);

    return (

        <svg ref={ref} className='mainsvg'>
            <SkewContainer data={data} >
                <SkewBackground data={data} >
                    <Isobars />
                    <Isotherms />
                </SkewBackground>
                <SkewWindbarbs data={data} />
                {/* <SkewWindbarbs data={data} state={state} setState={setState} />
                <SkewTooltips data={data} state={state} setState={setState} />
                <SkewContainer data={data} state={state} setState={setState} /> */}
            </SkewContainer>
        </svg>
    );
}



function SkewWindbarbs({ data }) {

    const { ref, state, setState } = useD3((skewWindbarbs) => {



        return { _refs: { skewWindbarbs } }
    }, [data.length]);

    return <g ref={ref} />
}



function SkewContainer({ data, ...props }) {
    const { ref, state, setState } = useD3((skewContainer) => {
        return { _refs: { skewContainer } }
    }, [data.length]);

    return <g ref={ref} className='' {...props} />;
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
    // const { ref, state, setState } = useD3((skewContainer) => {
    //     return { _refs: { skewContainer } }
    // }, [data.length]);
    return <canvas className='cloud' style={{ width: 1, height: 200 }} />;
}



// function SkewWindbarbs({ data, state, setState }) {
//     const withD3 = useCallback((skewWindbarbs) => {
//         setState(({ _refs, ...oldState }) => ({ ...oldState, _refs: { ..._refs, skewWindbarbs } }))
//     }, [setState]);
//     return <SVGGElement className='windbarb' withD3={withD3} data={data} />;
// }

// function SkewTooltips({ data, state, setState }) {
//     const withD3 = useCallback((skewTooltips) => {
//         setState(({ _refs, ...oldState }) => ({ ...oldState, _refs: { ..._refs, skewTooltips } }))
//     }, [setState]);
//     return (
//         <>
//             <SVGGElement className='tooltips' withD3={withD3} data={data} />;
//             <SVGRectElement className='overlay' withD3={withD3} data={data} />
//         </>
//     );
// }

// /**@ELEMENTS */
// function SVGGElement({ withD3, data, ...props }) {
// 	const ref = useD3(withD3, [data.length]);
// 	return <g ref={ref} {...props} />;
// }

// function SVGRectElement({ withD3, data, ...props }) {
// 	const ref = useD3(withD3, [data.length]);
// 	return <g ref={ref} {...props} />;
// }

// export type SKEWTState = {
// 	options: {
// 		gradient: number;
// 		tangent: any;
// 		barbSize: number;
// 		altTicks: number[];
// 		onEvent?: (type: string) => void;
// 	};
// 	styles: {
// 		width: number;
// 		height: number;
// 		margin: { top: number; right: number; bottom: number; left: number };
// 	};
// 	_lines: {
// 		[key: string]: any;
// 	};
// 	axes: SKEWTAxes;
// 	scales: SKEWScale;
// 	_btns: { dryAdiabat: { active: boolean }; moistAdiabat: { active: boolean }; isohume: { active: boolean }; temp: { active: boolean }; pressure: { active: boolean } };
// 	_loadState: { vars: boolean; background: boolean };
// 	_temp: { mid: number; range: number };
// 	_pressure: { top: number; base: number; increment: number; ticks: number[]; lines: number[] };
// 	_moving: boolean;
// 	// _vars: boolean;
// 	// _background: boolean;
// };

// const makeAltTicks = function (altTicks: number[] = []) {
// 	for (let i = 0; i < 20000; i += 10000 / 3.28084) altTicks.push(pressureFromElevation(i));
// 	return altTicks;
// };
// const _pressure = { top: 100, base: 1050, increment: -50, ticks: [950, 900, 800, 750, 650, 600, 550, 450, 400, 350, 250, 150], lines: [1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 50] };
// const _btns = { dryAdiabat: { active: false }, moistAdiabat: { active: false }, isohume: { active: false }, temp: { active: false }, pressure: { active: false } };
// let x, y, xAxis0, yAxis0, yAxis1, yAxis2, width, height;
// const constantState = {
// 	styles: {
// 		width,
// 		height,
// 		margin: { top: 10, right: 25, bottom: 10, left: 25 },
// 	},
// 	scales: { x, y },
// 	axes: { xAxis0, yAxis0, yAxis1, yAxis2 },
// 	// axes: { xAxis0: undefined, yAxis0: undefined, yAxis1: undefined, yAxis2: undefined },
// 	_loadState: { moving: false, vars: false, background: false },
// 	_lines: {},
// 	_temp: { mid: 0, range: 60 },
// 	_moving: false,
// 	_pressure,
// 	_btns,
// 	// _vars: false,
// 	// _background: false,
// };

// export default function Skewt({ data, onEvent, gradient = 45 }: { data: TSounding; [x: string]: any }) {
// 	const [state, setState] = useState(() => {
// 		const initialState: SKEWTState = {
// 			...constantState,
// 			options: {
// 				gradient,
// 				onEvent,
// 				barbSize: 25,
// 				tangent: Math.tan(gradient * DEG2RAD),
// 				altTicks: makeAltTicks(),
// 			},
// 		};
// 		return initialState;
// 	});

// 	const {
// 		styles: { margin },
// 		options: { altTicks },
// 		_temp,
// 		_pressure,
// 	} = useMemo(() => state, [state]);

// 	const setVariables = useCallback(
// 		(ref: D3Selection) => {
// 			const width = parseInt(ref.style('width'), 10) - 10 - margin.left - margin.right; // tofix: using -10 to prevent x overflow
// 			const height = width - margin.top - margin.bottom;
// 			// const tan = Math.tan((gradient || 45) * DEG2RAD);
// 			const x = d3
// 				.scaleLinear()
// 				.range([-width / 2, width + width / 2])
// 				.domain([_temp.mid - _temp.range * 2, _temp.mid + _temp.range * 2]); //range is w*2
// 			const y = d3.scaleLog().range([0, height]).domain([_pressure.top, _pressure.base]);

// 			const xAxis0 = d3.axisBottom(x).tickSize(0).ticks(20); //.orient("bottom");
// 			const yAxis0 = d3
// 				.axisLeft(y)
// 				.tickSize(0)
// 				.tickValues(_pressure.lines.filter((p) => p % 100 === 0 || p === 50 || p === 150))
// 				.tickFormat(d3.format('.0d')); //.orient("left");

// 			const yAxis1 = d3.axisRight(y).tickSize(5).tickValues(_pressure.ticks); //.orient("right");
// 			const yAxis2 = d3.axisLeft(y).tickSize(2).tickValues(altTicks);
// 			const scales = { x, y };
// 			const axes = { xAxis0, yAxis0, yAxis1, yAxis2 };
// 			// console.log({ style: { width: w, height: h } });
// 			const _vars = true;
// 			setState(({ styles, _loadState, ...oldState }) => {
// 				return { ...oldState, styles: { ...styles, width, height }, _loadState: { ..._loadState, vars: true }, scales, axes, _vars };
// 			});
// 		},
// 		[margin, altTicks, _temp, _pressure]
// 	);
// 	// * onData => setVariables
// 	const ref = useD3(setVariables, [data.length]);
// 	return (
// 		<div ref={ref}>
// 			<MainSVG className='mainsvg' data={data} state={state} setState={setState}>
// 				{/* <Container className='container' data={data} state={state} setState={setState}> */}
// 				{/* <Overlay className='overlay' data={data} state={state} setState={setState} /> */}
// 				<Background className='skewtbg' data={data} state={state} setState={setState} />
// 				{/* </Container> */}
// 			</MainSVG>
// 		</div>
// 	);
// }
// interface SKEWTAxes {
// 	xAxis0: d3.Axis<d3.NumberValue>;
// 	yAxis0: d3.Axis<d3.NumberValue>;
// 	yAxis1: d3.Axis<d3.NumberValue>;
// 	yAxis2: d3.Axis<d3.NumberValue>;
// }
// interface SKEWScale {
// 	x: d3.ScaleLinear<number, number, never>;
// 	y: d3.ScaleLogarithmic<number, number, never>;
// }
// export type SKEWTProps = {
// 	[x: string]: any;
// 	data: TSounding;
// 	state: SKEWTState;
// 	setState: React.Dispatch<React.SetStateAction<SKEWTState>>;
// };
