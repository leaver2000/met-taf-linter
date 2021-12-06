import { useMemo, useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Skewt from '../views/react-skewt';
// import { sounding } from '../data/sounding';
import TimeControl from './time-ctrl';
import { useCTX } from '../controller/ctx-controller';
import { useFetch } from '../hooks/use-fetch';
// import { dataset } from '../data/dataset';
const SX = {
	padding: 2,
	width: '100',
	height: '100',
	backgroundColor: 'primary.dark',
	// '&:hover': {
	// 	backgroundColor: 'red',
	// 	opacity: [0.9, 0.8, 0.7],
	// },
};
type Data = { press: number[]; hght: number[][]; temp: number[][]; dwpt: number[][]; wdir: number[][]; wspd: number[][] };

function useLab2(baseUrl: string) {
	const [fullDataset, setFullDataset] = useState<Data | null>(null);
	const { getJSON } = useFetch(baseUrl);
	const callback2 = useCallback((res: any, err: any) => {
		if (!!err) {
			console.warn('FLASK API SERVER IS NOT RUNNING LOADING SAMPLE DATASET');
			console.log(err);
			import('../data/dataset').then(({ dataset }) => setFullDataset(dataset));
		} else setFullDataset(res.dataset);
	}, []);
	// with the /skewt2 path the server returns a complete dataset with 0-144hr valid time
	useEffect(() => getJSON('/skewt2', {}, callback2), [getJSON, callback2]);

	return { fullDataset };
}

export default function SkewtLab() {
	const [position, setPosition] = useState(null);
	const [palette, setPallet] = useState(palette1);
	const {
		index: { time, baseUrl, dataset },
		dispatch,
	} = useCTX();
	// const { getJSON } = useFetch(baseUrl);
	const { fullDataset } = useLab2(baseUrl);

	useEffect(() => {
		if (!!fullDataset) {
			const dataset = indexDataset(fullDataset, time);
			dispatch({ dataset });
		}
	}, [fullDataset, time, dispatch]);

	const onEvent = useMemo(
		() => ({
			click: (e) => {
				console.log(e);
			},
			focus: (e) => {},
			hover: (e) => {
				setPosition(e);
			},
		}),
		[]
	);
	const dispatchPalette = useCallback((palette) => {
		setPallet(palette);
	}, []);
	return (
		<Box sx={SX}>
			<TimeControl />
			<div>
				<button onClick={() => dispatchPalette(palette1)}>dispatch palette1</button>
				<button onClick={() => dispatchPalette(palette2)}>dispatch palette2</button>
			</div>
			{JSON.stringify(position)}
			<Skewt data={dataset} options={{ onEvent, palette }} />
		</Box>
	);
}
const indexDataset = ({ press, hght, temp, dwpt, wdir, wspd }: Data, tIdx: number) =>
	//
	press.map((press, i) => ({
		press, //presure values are static and do not require indexing
		hght: hght[tIdx][i],
		temp: temp[tIdx][i],
		dwpt: dwpt[tIdx][i],
		wdir: wdir[tIdx][i],
		wspd: wspd[tIdx][i],
	}));

const palette1 = {
	temperature: {
		stroke: 'red',
		opacity: 1,
		fill: 'none',
	},
	dewpoint: {
		stroke: 'green',
		opacity: 1,
		fill: 'none',
	},
	isobars: {
		stroke: 'black',
		opacity: 0.3,
		fill: 'none',
	},
	isotherms: {
		stroke: 'red',
		opacity: 0.3,
		fill: 'none',
	},
	elr: {
		stroke: 'purple',
		opacity: 0.3,
		fill: 'none',
	},
	isohumes: {
		stroke: 'purple',
		opacity: 0.3,
		fill: 'none',
	},
	dryAdiabats: {
		stroke: 'orange',
		opacity: 0.3,
		fill: 'none',
	},
	moistAdiabats: {
		stroke: 'green',
		opacity: 0.3,
		fill: 'none',
	},
	grid: {
		stroke: 'black',
		opacity: 1,
		fill: 'none',
	},

	background: 'grey', //dark grey
	foreground: 'white', //light grey
};

const palette2 = {
	temperature: {
		stroke: '#66d9ef', //blue
		opacity: 1,
		fill: 'none',
	},
	dewpoint: {
		stroke: '#a6e22e', //lime
		opacity: 1,
		fill: 'none',
	},
	isobars: {
		stroke: '#f92672', //red
		opacity: 0.3,
		fill: 'none',
	},
	isotherms: {
		stroke: '#f92672', //red
		opacity: 0.3,
		fill: 'none',
	},
	elr: {
		stroke: '#ae81ff', //purple
		opacity: 0.7,
		fill: 'none',
	},
	isohumes: {
		stroke: 'purple',
		opacity: 0.3,
		fill: 'none',
	},
	dryAdiabats: {
		stroke: '#fd971f', //orange
		opacity: 0.3,
		fill: 'none',
	},
	moistAdiabats: {
		stroke: '#a6e22e', //lime
		opacity: 0.3,
		fill: 'none',
	},
	grid: {
		stroke: 'black',
		opacity: 1,
		fill: 'none',
	},
	background: 'black', //dark grey
	foreground: '#272822', //light grey
};
