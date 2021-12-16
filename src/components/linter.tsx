import React from 'react';
import Prism from 'prismjs';
import { Expression } from './expression';
import { useParser } from '../hooks/use-parser';

export function Linter() {
	const ref: React.MutableRefObject<any> = React.useRef();
	React.useEffect(() => Prism.highlightElement(ref.current));
	const { success, error, tafString, errorString, setParserState } = useParser();

	const update = React.useCallback(
		(tafString: string) => {
			if (tafString[tafString.length - 1] === '\n') {
				tafString += ' ';
			}
			setParserState(({ ...oldState }) => ({ ...oldState, tafString }));
		},
		[setParserState]
	);

	const onInput = React.useCallback(
		(e: React.BaseSyntheticEvent) => {
			var text: string = e.target.value;
			update(text);
		},
		[update]
	);

	const onKeyDown = React.useCallback(
		(e) => {
			// console.log(e);
			const element = e.target;
			let code = element.value;
			// console.log({ element });
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
		},
		[update]
	);

	return (
		<div style={{ color: 'white' }}>
			<Expression ref={ref} onInput={onInput} onKeyDown={onKeyDown} value={tafString} errorOverlay={errorString} />
			<PassFailDisplay pass={success} error={error} />
		</div>
	);
}

// function E2({errorOverlay,...props}){
// 	return <div style={{ position: 'relative', width: 800, height: 200, border: `solid ${!!errorOverlay ? 'red' : 'green'}`, backgroundColor: 'grey', ...font }} {...props}>
// }

// interface KeyboardEvent<T = Element> extends React.SyntheticEvent<T, NativeKeyboardEvent> {
// 	altKey: boolean;
// 	/** @deprecated */
// 	charCode: number;
// 	ctrlKey: boolean;
// 	getModifierState(key: string): boolean;
// 	key: string;
// 	/** @deprecated */
// 	keyCode: number;
// 	locale: string;
// 	location: number;
// 	metaKey: boolean;
// 	repeat: boolean;
// 	shiftKey: boolean;
// 	/** @deprecated */
// 	which: number;
// }
function PassFailDisplay({ pass, error }) {
	return (
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
	);
}

function Pass({ data }) {
	const [header, changeGroups, temperatureGroup] = data;
	return (
		<div>
			<TypeTimeLine datums={header} />
			{!!changeGroups ? changeGroups.map((group) => <TypeTimeLine datums={group} />) : null}
			TEMPERATURE GROUP:
			<br />
			{JSON.stringify(temperatureGroup)}
			<br /> <br />
			Destructuring:
			<br />
			LINE:[
			<br />
			<Indent>[ddd ff (Gfmfm | null)] VVVV [ WW[] ] </Indent>
			<Indent>[[NsNsNs hshshs CC][...] || SKC] ( [VAbbbttt] | null ) ( [WShxhxhx/dddfffKT] | null )</Indent>
			<Indent> ( [6IchihihitL] | null ) ( [5BhBhBhBtL] | null ) [QNHP1P1P1P1INS] (Remarks)</Indent>
			]<br />
			WW:[[ PRECIP ] [ OBSCURATION ] [ VC ]]
			<br />
			PRECIP:[INTENSITY DESCRIPTOR PRECIPITATION PRECIPITATION?]
			<br />
			OBSCURATION:
			<br />
			VC:
		</div>
	);
}

const Indent = ({ ...props }) => <div style={{ textIndent: '20px' }} {...props} />;

function TypeTimeLine({ datums }) {
	const [type, time, line] = datums;
	return (
		<>
			TYPE:
			{JSON.stringify(type)}
			<br />
			TIME:
			{JSON.stringify(time)}
			<br />
			LINE:
			<br />
			{JSON.stringify(line)}
			<br /> <br />
		</>
	);
}

function Fail({ data }) {
	return (
		<div>
			Error Name:
			<div>{JSON.stringify(data.name)}</div>
			<br />
			Error Message:
			<div>{JSON.stringify(data.message)}</div>
			<br />
			Expected:
			<div>{JSON.stringify(data.expected)}</div>
			<br />
			Error Found:
			<div>{JSON.stringify(data.found)}</div>
			<br />
			Error Location:
			<div>{JSON.stringify(data.location)}</div>
			<br />
			{/* <div>{JSON.stringify({ data })}</div> */}
		</div>
	);
}

// type dddffGfmfmKT = [string, number, number];
// type VVVV = number;

// // Precipitation? Obscuration? Vicinity?
// type Obscuration = [];
// type Precipitation = [];
// type Vicinity = [];

// /**
//  * ```
//  * type WW = "NSW" | [[['+', 'TSRAGR']],[fg],[]] | null
//  * ```
//  * */
// type WW = [Precipitation | null, Obscuration | null, Vicinity | null] | string | null;

/**
 * EX:
 * ```
 * 'SKC'
 * [ [...] null [...] ]
 *
 *
 * 'BKN020CB BKN035 OVC050'
 * [ [...] [null null null null [2000 true] 3500 null [5000 false]] [...] ]
 * ```
 * DESTRUCTURE:
 * ```
 * if(!!NsNsNshshshsCC){
 * 	const [L1, L2, L3, L4, [L5, CB_Flag1], L6, L7, [L8, CB_Flag2]] = NsNsNshshshsCC
 * }
 * ```
 */

// type NsNsNshshshsCC = [number, number, number, number, [number, boolean], number, number, [number, boolean]];
// type VVhshshs = [string, number];

// type PredominateLine = [dddffGfmfmKT, VVVV, WW, NsNsNshshshsCC | VVhshshs | null];
// type TemporaryLine = [dddffGfmfmKT | null, VVVV | null, WW | null, NsNsNshshshsCC | null];

// type Heading = [[string, string | null, string, Date], [Date, Date], PredominateLine];
// type ChangeLines = [string, [Date, Date], PredominateLine | TemporaryLine[]];

// type TX = [number, Date];
// type TN = [number, Date];

// type TAF = [Heading, ChangeLines[], [TX, TN]];
// console.log(TAF)
