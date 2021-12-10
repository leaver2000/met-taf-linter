import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Expression } from './expression';
// import { parser } from '../parser';
import Prism from 'prismjs';
import * as parser from '../parsers/taf-parser';
type LinterState = {
	tafString: string;
	date: Date;
	pass: null | any;
	error: null | any;
};

function useParser() {
	const [{ pass, error, tafString, date }, setParserState] = useState<LinterState>({ pass: null, error: null, tafString: sampleTaf, date: new Date() });

	const utcDateValues = useMemo(
		() => ({
			//
			UTCString: date.toUTCString(),
			year: date.getUTCFullYear(),
			month: date.getUTCMonth(),
			day: date.getUTCDate(),
		}),
		[date]
	);
	const onChange = useCallback((pass, error) => {
		setParserState(({ ...oldState }) => ({ ...oldState, pass, error }));
		if (!!error) {
			//handle syntax highligting
		}
	}, []);
	useEffect(() => {
		try {
			const pass = parser.parse(tafString.toUpperCase(), {
				...utcDateValues,
				icao: 'KADW',
				AMD: false,
				COR: false,
				isConusLocation: true,
			});
			onChange(pass, null);
		} catch (e) {
			onChange(null, e);
		}
	}, [tafString, date, onChange, utcDateValues]);

	return { pass, error, tafString, setParserState };
}

export function Linter() {
	const expressionRef: React.MutableRefObject<any> = useRef();
	const { pass, error, tafString, setParserState } = useParser();

	const update = (text: string) => {
		if (text[text.length - 1] === '\n') {
			text += ' ';
		}
		setParserState(({ ...oldState }) => ({ ...oldState, tafString: text }));
		// setCodeValue(({ ...old }) => ({ ...old, tafString: text }));
		Prism.highlightElement(expressionRef.current);
	};

	const onInput = (e) => {
		var text: string = e.target.value;
		update(text);
	};

	const onKeyDown = (e) => {
		const element = e.target;
		let code = element.value;
		switch (e.key) {
			case 'Tab':
				e.preventDefault();
				let before_tab = code.slice(0, element.selectionStart);
				let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
				let cursor_pos = element.selectionEnd + 1;
				element.value = before_tab + '\t' + after_tab; // add tab char
				// move cursor
				element.selectionStart = cursor_pos;
				element.selectionEnd = cursor_pos;
				update(element.value);
				break;
			default:
				return;
		}
	};

	return (
		<div>
			<Expression ref={expressionRef} onInput={onInput} onKeyDown={onKeyDown} value={tafString} />

			<div
				//\
				style={{
					//
					color: 'white',
					position: 'relative',
					width: 800,
					border: `solid ${!!pass ? 'green' : 'red'}`,
					backgroundColor: 'black',
				}}>
				{!!pass ? <Pass data={pass} /> : !!error ? <Fail data={error} /> : null}
			</div>
		</div>
	);
}

function Pass({ data }) {
	return (
		<div>
			PASS!!
			<br />
			{data.map((d) => (
				<>
					{JSON.stringify(d)}
					<br />
					<br />
				</>
			))}
		</div>
	);
}

function Fail({ data }) {
	console.log(data);
	return (
		<div>
			ERROR TYPE:
			<div>{JSON.stringify(data.type)}</div>
			<br />
			MESSAGE:
			<div>{JSON.stringify(data.message)}</div>
			<br />
			EXPECTED:
			<div>
				{JSON.stringify(Array.isArray(data.expected))}
				<br />
				{JSON.stringify(data.expected)}
			</div>
			<br />
			FOUND:
			<div>{JSON.stringify(data.found)}</div>
			FOUND:
			<div>{JSON.stringify(data.location)}</div>
			<br />
			{/* <div>{JSON.stringify({ data })}</div> */}
		</div>
	);
}

const style: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
};
const dims: React.CSSProperties = {
	margin: '10px',
	padding: '10px',
	border: 0,
	width: 'calc(100% - 32px)',
	height: '150px',
};
const TextArea = ({ ...props }) => (
	<textarea
		style={{
			//
			...style,
			...dims,
			zIndex: 1,
			color: 'transparent',
			backgroundColor: 'transparent',
			caretColor: 'white',
		}}
		id='editing'
		spellCheck='false'
		{...props}
	/>
);

const PreFormatted = ({ ...props }) => (
	<pre
		style={{
			//
			...style,
			...dims,
			zIndex: 0,
		}}
		id='highlighting'
		aria-hidden='true'
		{...props}
	/>
);

const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 8000 TSRA BKN030CB QNH2902INS
BECMG 0716/0705 01015G17KT 9999 BKN020 BKN020 QNH2902INS
BECMG 0704/0705 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
