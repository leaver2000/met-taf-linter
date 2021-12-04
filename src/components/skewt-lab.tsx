import { useMemo, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Skewt from '../views/react-skewt';
import { sounding } from '../data/sounding';
import TimeControl from './time-ctrl';

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

export default function SkewtLab() {
	const [position, setPosition] = useState(null);
	const [palette, setPallet] = useState(palette1);

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
			<Skewt data={sounding} options={{ onEvent, palette }} />
		</Box>
	);
}

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
