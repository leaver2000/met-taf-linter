// import React, { useEffect, useCallback, useState, useReducer, useMemo } from 'react';
import useD3 from '../hooks/use-skewt';
// import * as d3 from 'd3';

export default function MainSVG({ data, state, setState, ...props }) {
	const ref = useD3((elm) => {}, [data]);
	return <svg ref={ref} style={{ ...state.margin }} {...props} />;
}
