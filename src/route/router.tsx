import { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Meteogram from '../components/meteogram';
import Box from '@mui/material/Box';
import SkewtLab from '../views/react-skewt';
import { sounding } from '../data/sounding';

const SX = {
	padding: 2,
	// margin: 1,
	width: '100',
	height: '100',
	backgroundColor: 'primary.dark',
	'&:hover': {
		backgroundColor: 'red',
		opacity: [0.9, 0.8, 0.7],
	},
};

function SkewtApp() {
	const [position, setPosition] = useState(null);
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
	return (
		<Box sx={SX}>
			{JSON.stringify(position)}
			<SkewtLab data={sounding} options={{ onEvent }} />
		</Box>
	);
}

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<SkewtApp />} />
			</Routes>
		</BrowserRouter>
	);
}

// const palette2 = {
// 	temperature: {
// 		stroke: '#66d9ef', //blue
// 		opacity: 1,
// 		fill: 'black',
// 	},
// 	dewpoint: {
// 		stroke: '#a6e22e', //lime
// 		opacity: 1,
// 		fill: 'none',
// 	},
// 	isobars: {
// 		stroke: '#f92672', //red
// 		opacity: 0.3,
// 		fill: 'black',
// 	},
// 	isotherms: {
// 		stroke: '#f92672', //red
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	elr: {
// 		stroke: '#ae81ff', //purple
// 		opacity: 0.7,
// 		fill: 'none',
// 	},
// 	isohumes: {
// 		stroke: 'purple',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	dryAdiabats: {
// 		stroke: '#fd971f', //orange
// 		opacity: 0.3,
// 		fill: 'black',
// 	},
// 	moistAdiabats: {
// 		stroke: '#a6e22e', //lime
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	grid: {
// 		stroke: 'black',
// 		opacity: 1,
// 		fill: 'none',
// 	},
// 	background: 'black', //dark grey
// 	foreground: '#272822', //light grey
// };

// const palette1 = {
// 	temperature: {
// 		stroke: 'red',
// 		opacity: 1,
// 		fill: 'none',
// 	},
// 	dewpoint: {
// 		stroke: 'green',
// 		opacity: 1,
// 		fill: 'none',
// 	},
// 	isobars: {
// 		stroke: 'black',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	isotherms: {
// 		stroke: 'red',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	elr: {
// 		stroke: 'purple',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	isohumes: {
// 		stroke: 'purple',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	dryAdiabats: {
// 		stroke: 'orange',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	moistAdiabats: {
// 		stroke: 'green',
// 		opacity: 0.3,
// 		fill: 'none',
// 	},
// 	grid: {
// 		stroke: 'black',
// 		opacity: 1,
// 		fill: 'none',
// 	},

// 	background: 'grey', //dark grey
// 	foreground: 'white', //light grey
// };
