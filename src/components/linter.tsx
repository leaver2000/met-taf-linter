import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Expression } from './expression';
import Prism from 'prismjs';
import { tafParser } from '../parsers';
import { DateException } from '../exceptions';
import type { Found } from '../exceptions';
// import { DateException } from '../exceptions';
import { DateValidator } from '../validators';
// Expected,Found
type LinterState = {
	tafString: string | any;
	date: Date;
	pass: null | any;
	error: null | any;
};
const foundUnknown = {
	start: {
		offset: 0,
		line: 0,
		column: 0,
	},
	end: {
		offset: 0,
		line: 0,
		column: 0,
	},
};
// class LineValidator {
// 	constructor(line) {
// 		console.log(line);
// 		return;
// 	}
// }

function splitError(tafString, sliceOffset) {
	const errorSection = tafString.slice(sliceOffset);
	const endOfError = errorSection.match(/(?<=.[\t\n\r ])/).index;
	const errorString = errorSection.slice(0, endOfError);
	const restOfTAF = errorSection.slice(endOfError);

	return [tafString.slice(0, sliceOffset), errorString, restOfTAF];
}

function useParser() {
	const [{ pass, error, tafString, date }, setParserState] = useState<LinterState>({ pass: null, error: null, tafString: sampleTaf, date: new Date() });

	const [errorString, setErrorString] = useState<null | any>(null);

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
	const onChange = useCallback(
		(pass, error) => {
			setParserState(({ ...oldState }) => ({ ...oldState, pass, error }));
			if (!!error) {
				try {
					const { start } = error.location;
					const [theStart, theError, theEnd] = splitError(tafString, start.offset);
					setErrorString([theStart, theError, theEnd]);
				} catch (e) {
					console.log(error.type, error.location);
				}
			} else {
				setErrorString(null);
			}
		},
		[tafString]
	);

	const secondaryValidation = useCallback((validSyntax) => {
		// const [[headerInformation, [start, stop], firstLine], mainBody, temperatureGroup] = validSyntax;
		// const [TAF, AMD_COR, ICAO, issued] = headerInformation;

		// const dv = new DateValidator([issued, start, stop], { AMD_COR }, () => {});

		// if (!!mainBody) {
		// 	mainBody.reduce((memo, [type, time, line]) => {
		// 		switch (type) {
		// 			case 'BECMG':
		// 				dv.validateBECMG(time, (err) => {
		// 					throw new DateException({ ...err, found: foundUnknown });
		// 				});

		// 				break;
		// 			case 'TEMPO':
		// 				break;
		// 			default:
		// 				break;
		// 		}

		// 		// console.log(memo, type, time, line);

		// 		return [...memo, [type, time, line]];
		// 	}, []);
		// }

		return validSyntax;
	}, []);

	// Expected,Found

	useEffect(() => {
		try {
			const validSyntax = tafParser.parse(tafString.toUpperCase(), {
				...utcDateValues,
				validator,
				icao: 'KADW',
				AMD: false,
				COR: false,
				isConusLocation: true,
			});

			const success = secondaryValidation(validSyntax);

			onChange(success, null);
		} catch (e) {
			onChange(null, e);
		}
	}, [tafString, date, onChange, utcDateValues, secondaryValidation]);

	return { pass, error, tafString, setParserState, errorString };
}

const options = { isConusLocation: true };
function validator(type: string, { found, value, location }: { found: Found; value: any; location: () => any }) {
	console.log(type, found);
	switch (type) {
		case 'BECMG':
			console.log(location());
			const { time, line } = value;
			const [start, end] = time;
			if (new Date(start) >= new Date(end)) {
			}
			// throw new EncodingException({
			//     message:`${type} Group START time should occur before the END time`,
			//     expected:[{
			//         type:"literal",
			//         description:"BLAH; YYG1G1/YYG2G2 @AFMAN 15-124 1.3.2.1.5."}
			//         ],
			//     found: location()
			//     });
			break;
		case 'TEMPO':
			break;
		case 'VVVV':
			if (options.isConusLocation && value === 4800) {
				throw new DateException({
					// type:'SyntaxException',
					message: 'Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.',
					found,
				});
			} else if (!options.isConusLocation && value === 5000)
				throw new DateException({
					// type:'SyntaxException',
					message: 'Note 1: Substitute 5000 meters for 4800 meters Outside the Continental United States (OCONUS) locations based on the host-nation national practice.',
					found,
				});
			return;

		default:
			return;
	}
}

export function Linter() {
	const expressionRef: React.MutableRefObject<any> = useRef();
	const { pass, error, tafString, errorString, setParserState } = useParser();

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
	useEffect(() => {
		if (!!error) {
			// console.log(error);
			try {
				error.expected.forEach((e) => {
					try {
						switch (e.type) {
							case 'literal':
								// console.log(e.text);
								break;
							default:
								break;
						}
						const a = e.description.split(/\s*;\s*|\s*@\s*/);
						// console.log(a);
						// const [expected, ref] = e.description.split(/\s*@\s*/);
						// console.log([...expected.split(/\[.*\]/), ref]);
					} catch (err) {
						// console.log('ERROR SPLIT REPORTING NOT SUPPORTED', err);
					}
				});
			} catch (e) {}
		}
	}, [error]);
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
			<Expression ref={expressionRef} onInput={onInput} onKeyDown={onKeyDown} value={tafString} errorOverlay={errorString} />
			<PassFailDisplay pass={pass} error={error} />
		</div>
	);
}

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

type TAFNDArray = [[string, number, number | null], number, WW, NsNsNshshshsCC];

const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 8000 TSRA BKN030CB QNH2902INS
BECMG 0704/0705 01015G17KT 9999 BKN020 BKN020 QNH2902INS
BECMG 0705/0706 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
// TAF (AMD or COR) CCCC YYGGggZ YYG1G1/YYG2G2
//	dddffGfmfmKT VVVV
// w’w’ NsNsNshshshsCC or VVhshshs or SKC (VAbbbttt) (WShxhxhx/dddfffKT)
// (6IchihihitL) (5BhBhBhBtL) QNHP1P1P1P1INS (Remarks)
// TTTTT YYGGGeGe or YYGG/YYGeGe ddffGfmfmKT…same as above… (Remarks)
// TX(M)TFTF/YYGFGFZ TN(M)TFTF/YYGFGFZ

type dddffGfmfmKT = [string, number, number];
type VVVV = number;

// Precipitation? Obscuration? Vicinity?
type Obscuration = [];
type Precipitation = [];
type Vicinity = [];

/**
 * ```
 * type WW = "NSW" | [[['+', 'TSRAGR']],[fg],[]] | null
 * ```
 * */
type WW = [Precipitation | null, Obscuration | null, Vicinity | null] | string | null;

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

type NsNsNshshshsCC = [number, number, number, number, [number, boolean], number, number, [number, boolean]];
type VVhshshs = [string, number];

type PredominateLine = [dddffGfmfmKT, VVVV, WW, NsNsNshshshsCC | VVhshshs | null];
type TemporaryLine = [dddffGfmfmKT | null, VVVV | null, WW | null, NsNsNshshshsCC | null];

type Heading = [[string, string | null, string, Date], [Date, Date], PredominateLine];
type ChangeLines = [string, [Date, Date], PredominateLine | TemporaryLine[]];

type TX = [number, Date];
type TN = [number, Date];

type TAF = [Heading, ChangeLines[], [TX, TN]];
