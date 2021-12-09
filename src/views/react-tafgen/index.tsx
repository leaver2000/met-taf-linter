import React, { useState, useEffect, useReducer, useRef } from 'react';
import Box from '@mui/material/Box';
import ContentEditable from 'react-contenteditable';
import { Command, useC2 } from './controller/c2';
// import { parser, sampleTaf } from './parser';
// import JSONTree from 'react-json-tree';
import { Linter } from './components/linter';
import './css/index.css';
export const monokai = {
	background: 'rgb(30,31,28)',
	foreground: 'rgb(48,40,34)',
	active: 'rgb(62,61,50)',
	red: 'rgb(249,38,114)',
	blue: 'rgb(102,217,239)',
	green: 'rgb(116,226,40)',
};

export default function TafGen() {
	return (
		<Command>
			<div style={{ height: '100vh', width: '100%', backgroundColor: monokai.background, color: monokai.red }}>
				<Box
					component='form'
					sx={{
						'& .MuiTextField-root': { m: 1, width: '25ch' },
					}}
					noValidate
					autoComplete='off'>
					<Pad>
						<h2>TAF-LINT 0.1</h2>
					</Pad>
					<Linter />
				</Box>
			</div>
		</Command>
	);
}

function reducer({ ...oldState }, { type, ...event }) {
	switch (type) {
		case 'blur':
			return { ...oldState, backgroundColor: 'inherit' };
		case 'focus':
			return { ...oldState, backgroundColor: monokai.active };

		default:
			// console.log(type);
			return oldState;
	}
}

/**
1.3.2.1. Message Heading (TAF [AMD or COR] CCCC YYGGggZ YYG1G1/YYG2G2).

The message heading consists of:

1.3.2.1.1. Message identifier of TAF

1.3.2.1.2. Forecast modifier indicating an amendment or correction (AMD or COR).
Only one modifier at a time.
AFMAN15-124 16 JANUARY 2019 7

1.3.2.1.2.1. When issuing an amendment (AMD), issue only the remaining valid
period of the TAF (e.g. If a TAF originally starting at 1600Z is amended at 1847Z,
only forecast groups valid at and after 1800Z are included; groups that are no longer
valid are removed).

1.3.2.1.2.2. When issuing a correction (COR), issue the entire original text of the
TAF, changing only the TAF header and the erroneous elements (e.g., if a TAF
originally starting at 1600Z is corrected at 1615Z, all forecast g
 */
export function HEAD() {
	const { state } = useC2();
	console.log(state);
	return <LINE immutableText={`${state.icao}`} />;
}

export function TEMPO() {
	return <LINE immutableText={'TEMPO'} />;
}
export function BECMG() {
	return <LINE immutableText={'BECMG'} />;
}
const { localStorage } = window;

function LINE({ immutableText }) {
	const {
		onEnter,
		// state: { parser },
	} = useC2();
	const ref: React.MutableRefObject<any> = useRef();
	const [{ backgroundColor }, dispatch] = useReducer(reducer, {
		backgroundColor: 'inherit',
		// innerHTML: '',
	});
	const [html, setHtml] = useState('');
	useEffect(() => {
		const cat = localStorage.getItem('TAF-LAB');
		if (!!cat) setHtml(cat);
	}, []);
	const handleChange = (evt) => {
		const { value } = evt.target;
		localStorage.setItem('TAF-LAB', value);

		try {
			// const result = parser.parse(value);
		} catch (e) {
			console.log(e);
		}
		// console.log(result);
		setHtml(value);
	};
	useEffect(() => {
		if (!!ref.current) {
			ref.current.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					onEnter(e);
				}
			});
		}
	}, [onEnter]);
	return (
		<div onBlur={dispatch} onFocus={dispatch}>
			{immutableText}
			<ContentEditable
				style={{ backgroundColor, width: '100', display: 'inline-block' }}
				innerRef={ref}
				html={html} // innerHTML of the editable div
				onChange={handleChange} // handle innerHTML change
			/>
		</div>
	);
}

export const Pad = ({ ...props }) => <div style={{ padding: 10 }} {...props} />;
