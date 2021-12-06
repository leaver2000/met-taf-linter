import { createContext, useContext, useReducer } from 'react';

/**@Hook */
export const useCTX = () => {
	const { index, dispatch } = useContext(Context);
	return { index, dispatch };
};

/**@Provider */
export function CTXController({ ...props }) {
	const ctx = useController();
	return <Context.Provider value={{ ...ctx }} {...props} />;
}
const reducer = (oldState: object, newState: object) => ({ ...oldState, ...newState });
const initialIndex = {
	baseUrl: process.env.REACT_APP_API,
	level: 'sfc',
	time: 0,
	x: 0,
	y: 0,
};
function useController() {
	const [index, dispatch] = useReducer(reducer, initialIndex);
	return { index, dispatch };
}

const Context: any = createContext(useController);
