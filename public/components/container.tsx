// import React, { useEffect, useCallback, useState, useReducer, useMemo } from 'react';
import useD3 from '../hooks/use-skewt';
import { SKEWTProps } from '../skewt';
export default function Container({ data, state, setState, ...props }: SKEWTProps) {
	// console.log(props);
	const ref = useD3(
		(ref) => {
			return;
		},
		[data.length]
	);
	return <g ref={ref} {...props} />;
}
