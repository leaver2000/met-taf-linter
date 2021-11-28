// import React, { useEffect, useCallback, useState, useReducer, useMemo } from 'react';
import useD3 from '../hooks/use-skewt';
export default function Container({ state, setState, ...props }) {
	const ref = useD3((ref) => {
		return;
	}, []);
	return <g ref={ref} {...props} />;
}
