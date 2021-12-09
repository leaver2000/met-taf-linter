import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { parser } from '../parser';
import Prism from 'prismjs';

export function Linter() {
	const resultRef: React.MutableRefObject<any> = useRef();
	const [{ codeValue, date }, setCodeValue] = useState<{ codeValue: string; date: Date }>({ codeValue: sampleTaf, date: new Date() });
	const [{ pass, error }, setLintState] = useState({ pass: null, error: null });

	const onLintChange = useCallback((pass, error) => {
		setLintState({ pass, error });
		if (!!error) {
			//handle syntax highligting
		}
	}, []);
	const utcDateValues = useMemo(() => ({ UTCString: date.toUTCString(), year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() }), [date]);

	useEffect(() => {
		// const date =
		try {
			let v = parser.parse(codeValue, {
				...utcDateValues,
				// UTCString: date.toUTCString(),
				// year: date.getUTCFullYear(),
				// month: date.getUTCMonth(),
				// day: date.getUTCDate(),
				icao: 'KADW',
				AMD: false,
				COR: false,
				isConusLocation: true,
			});
			onLintChange(v, null);

			// setPass(v);
			// console.log('PASS');
			// v.forEach((e, i) => {
			// 	console.log('LINE', i);
			// 	console.log(e);
			// });
			// // console.log(v);
			// setFail(null);
		} catch (e) {
			onLintChange(null, e);
			// onError(e);
		}
	}, [codeValue, date, onLintChange]);
	const update = (text: string) => {
		if (text[text.length - 1] === '\n') {
			text += ' ';
		}
		// text = text.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('<', 'g'), '&lt;'); /* Global RegExp */
		setCodeValue(({ ...old }) => ({ ...old, codeValue: text }));
		Prism.highlightElement(resultRef.current);
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
			<div style={{ position: 'relative', width: 800, height: 200, border: 'solid red', backgroundColor: 'grey' }}>
				<TextArea onInput={onInput} onKeyDown={onKeyDown} value={codeValue} />
				<PreFormatted>
					<code ref={resultRef} className='language-html' id='highlighting-content'>
						{codeValue}
					</code>
				</PreFormatted>
			</div>
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

type FailMessage = {
	message: string;
	expected: { type: string; description: string }[];
};
// data.expected.map((d) => {
//     return (
//         <div>
//             TYPE={d.type}
//             <br />
//             DESCRIPTION={d.description}
//             <br />
//         </div>
//     );
// })
function Fail({ data }) {
	return (
		<div>
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
TAF KADW 280100Z 0701/0807 01010KT 9999 SKC QNH2902INS
BECMG 0716/0705 01015G17KT 9999 BKN020 BKN020 QNH2902INS
BECMG 0704/0705 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
