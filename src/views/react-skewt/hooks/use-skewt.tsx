import { useEffect, useRef, useCallback, useMemo } from 'react';
import { select } from 'd3';
import { useC2 } from '../controller/c2';

import type * as d3 from 'd3';
import type * as CTX from '../types';

export type SkewCTX = {
	options: CTX.Options;
	data: CTX.Data;
	datums: CTX.Data[];
	P: CTX._P;
	T: CTX._T;
	lineGen: {
		temp: d3.Line<[number, number]>;
		dewpt: d3.Line<[number, number]>;
		elr: d3.Line<[number, number]>;
		dalr: d3.Line<[number, number]>;
		malr: d3.Line<[number, number]>;
		isohume: d3.Line<[number, number]>;
	};
	axes: CTX.Axes;
	scales: CTX.Scales;
	_all: number[][];
	// eventHandler: (e: any) => void;
	mainDims: {
		margin: { top: number; right: number; bottom: number; left: number };
		height: number;
		width: number;
		xOffset: number;
	};
	// d3Refs: {
	// 	Main: Selection<any, unknown, null, undefined>;
	// 	skewBackground: Selection<any, unknown, null, undefined>;
	// 	[key: string]: Selection<any, unknown, null, undefined>;
	// };
	drawDiagram: (d3Sel: any) => {
		diagramLines: {
			isobars: any;
			isotherms: any;
			envLapseRate: any;
			dryAdiabats: any;
			moistAdiabats: any;
		};
	};
	drawSounding: (d3Sel: any) => void;
	drawTicks: (d3Sel: any) => void;
	setHoverPosition: React.Dispatch<React.SetStateAction<any>>;
	initialized: boolean;
};
export type setSkewCTX = React.Dispatch<React.SetStateAction<SkewCTX>>;

type USEC2 = {
	state: SkewCTX;
	setState: setSkewCTX;
};
// state, onResize, setState, setOnResize, setD3Refs
export function useD3(refKey: string | null, render?: (element: d3.Selection<any, unknown, null, undefined>) => { [key: string]: any } | void, deps?: React.DependencyList) {
	// statful CTX
	const { state, setState }: USEC2 = useC2();
	// const {} = useInitial();
	// console.log(state);
	const ref: React.MutableRefObject<any> = useRef();
	// memo'd state for effects
	const {
		mainDims: { width, height },
		initialized,
	} = useMemo(() => state, [state]);
	// console.log(state);
	// ! ...callbacks

	const renderCallback = useCallback(
		(d3Sel) => {
			if (!!render) {
				switch (refKey) {
					case 'Main':
					case 'Clipper':
						break;
					default:
						d3Sel.selectAll('*').remove();
						break;
				}

				render(d3Sel);
			}
		},
		[refKey, render]
	);
	// there are 2 useEffect render calls
	// the first is responsible for rendering the
	// non
	useEffect(() => {
		const d3Sel = select(ref.current);
		switch (refKey) {
			// Main is called to render regardless of height and width
			// as Main sets height and width
			case 'Main':
				// case 'Sounding':
				renderCallback(d3Sel);
				break;
			default:
				if (!!width && !!height) renderCallback(d3Sel);
				break;
		}
		return () => {};
		/**@IGNORE react-hooks/exhaustive-deps...//* only execute render when data changes*/
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref, refKey, width, height, ...(!!deps ? deps : [])]);

	/**@CustomHook -> d3.render Callbacks */
	// const draw = useDraw();

	const isInitialized = useCallback(() => initialized, [initialized]);
	return { ref, state, setState, isInitialized };
}
