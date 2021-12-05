import { createContext, useCallback, useState, useContext } from 'react';
import { HEAD, BECMG, TEMPO } from '../index';
/**@Hook */
export const useC2 = () => {
	const { state, setState } = useContext(CTX);

	// const [rows, setRows] = useState()

	const onEnter = useCallback(
		(e: KeyboardEvent) => {
			console.log(e);
			const { ctrlKey, shiftKey } = e; //altKey
			if (shiftKey) {
				setState(({ rows, ...prevState }) => ({ ...prevState, rows: [...rows, <BECMG />] }));
			}
			if (ctrlKey) {
				setState(({ rows, ...prevState }) => ({ ...prevState, rows: [...rows, <TEMPO />] }));
			}
		},
		[setState]
	);

	return { state, setState, onEnter };
};
/**@Provider */
export function Command({ ...props }) {
	const initalState = { icao: 'KBLV', validTime: new Date() };
	const ctx = useController(initalState);
	return <CTX.Provider value={{ ...ctx }} {...props} />;
}
// const [rows, setRow] = useState([<HEAD />]);
function useController(initalState) {
	const [state, setState] = useState({ ...initalState, rows: [<HEAD />] });
	return { state, setState };
}

const CTX: any = createContext(useController);
