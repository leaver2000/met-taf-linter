export const defaultOptions = {
	gradient: 45,
	onEvent: {
		click: (e: any) => void 0,
		hover: (e: any) => void 0,
	},
	palette: {
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
	},
};
