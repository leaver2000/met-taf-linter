// import { useEffect, useRef } from 'react';
// import { select } from 'd3';
import { useEffect, useRef, useCallback, useState, useMemo, createContext } from 'react';
import { select, range } from 'd3';
import * as atm from '../util/atmosphere';
const SkewtCTX = createContext(useCTX);

export function useD3(render: D3RenderCallback | void, deps: React.DependencyList) {
	const ref: React.MutableRefObject<any> = useRef();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => (!!render ? render(select(ref.current)) : void 0), [render, ...deps]);
	return ref;
}
export function useCTX() {
	const [state, dispatch] = useState(() => {
		let ticks = Array.from({ length: 10 }).reduce((array: any[], _, i) => [...array, 75 + i * 100, 100 + i * 100, 125 + i * 100, 150 + i * 100], []);
		// var altticks = [];
		// for (let i = 0; i < 20000; i += 10000 / 3.28084) altticks.push(atm.pressureFromElevation(i));

		const top = 50;
		const base = 1050;
		const increment = -50;
		range(base, top - 50, increment);
		return {
			_isoBars: {
				lines: [1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 50],
				top,
				base,
				ticks,
				increment,
			},

			_styles: { margin: { top: 30, right: 40, bottom: 20, left: 35 } },
			_isoTherms: { mid: 0, range: 50 },
			_buttons: {
				dryAdiabat: {
					highlight: false,
				},
				moistAdiabat: { highlight: false },
				isohume: { highlight: false },
				isoTherms: { highlight: false },
				isoBars: { highlight: false },
			},
			_windBarbs: {},
		};
	});
	const setState = useCallback((newState) => {
		dispatch((oldState) => {
			return { ...newState, ...oldState };
		});
	}, []);
	// console.log(state);
	// return { state, setState };
	return useMemo(() => ({ state, setState }), [state, setState]);
}

export default function SkewtController(props: any) {
	const ctx = useCTX();
	return <SkewtCTX.Provider value={ctx} {...props} />;
}
