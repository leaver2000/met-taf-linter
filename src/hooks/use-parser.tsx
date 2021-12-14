import React from 'react';
import { tafParser } from '../parsers';
import { DateValidator } from '../validators';
// import { Expression } from './expression';
// import Prism from 'prismjs';
// import { DateException, GeneralException } from '../exceptions';
// import type { Found } from '../exceptions';
// import { DateException } from '../exceptions';
// Expected,Found
type LinterState = {
	tafString: string | any;
	date: Date;
	pass: null | any;
	error: null | any;
};
const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 8000 TSRA BKN030CB QNH2902INS
BECMG 0704/0705 01015G17KT 9999 BKN020 BKN025 QNH2902INS
BECMG 0705/0706 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
export function useParser() {
	const [{ pass, error, tafString, date }, setParserState] = React.useState<LinterState>({ pass: null, error: null, tafString: sampleTaf, date: new Date() });

	const [errorString, setErrorString] = React.useState<null | any>(null);

	const utcDateValues = React.useMemo(
		() => ({
			//
			UTCString: date.toUTCString(),
			year: date.getUTCFullYear(),
			month: date.getUTCMonth(),
			day: date.getUTCDate(),
		}),
		[date]
	);
	const onChange = React.useCallback(
		(pass, error) => {
			// sets the error state for pass and failure
			setParserState(({ ...oldState }) => ({ ...oldState, pass, error }));
			if (!!error) {
				const arrayOfStrings = (function (type) {
					switch (type) {
						case 'DateError':
						case 'EncodingError':
							return splitError(tafString, error.location.start, error.location.end);
						// return [error.location.start, error.location.end];
						case 'SyntaxError':
							return splitError2(tafString, error.location.start.offset);
						// return [error.location.start.offset, error.location.end.offset];
						default:
							return [0, null];
					}
				})(error.name);

				// const [theStart, theError, theEnd] = splitError(tafString, start, end);
				setErrorString(arrayOfStrings);
			} else {
				setErrorString(null);
			}
		},
		[tafString]
	);

	const validate = React.useMemo(() => new Validator2({ isConusLocation: false }), []);
	React.useEffect(() => {
		try {
			//  throws SyntaxErrors
			const validSyntax = tafParser.parse(tafString.toUpperCase(), {
				...utcDateValues,
				validate,
			});
			// throws Encoding Errors
			const success = validate.encoding(validSyntax);
			onChange(success, null);
		} catch (e) {
			onChange(null, e);
			// console.log(e);
		}
	}, [tafString, date, onChange, utcDateValues, validate]);

	return { pass, error, tafString, setParserState, errorString };
}
// splits eeror at start of offset and end of offset uses peggy range() callback
function splitError(tafString: string, startOfError: number, endOfError: number) {
	const beforeError = tafString.slice(0, startOfError);
	const theError = tafString.slice(startOfError, endOfError);
	const afterError = tafString.slice(endOfError);
	return [beforeError, theError, afterError];
}
// splits error at start of offset and the first trailing whitespace
function splitError2(tafString: string, startOfError: number) {
	const beforeError = tafString.slice(0, startOfError);
	var theError = tafString.slice(startOfError);
	var endOfError = theError.match(/(?<=.[\t\n\r ])/);
	if (!!endOfError) {
		theError = theError.slice(0, endOfError.index);
		const afterError = theError.slice(endOfError.index);
		return [beforeError, theError, afterError];
	}
	return [beforeError, theError];
}

class Validator2 {
	isConusLocation = false;
	begin: Date | undefined;
	beginTime: number | undefined;
	end: Date | undefined;
	endTime: number | undefined;
	_dv: DateValidator | undefined;

	constructor({ isConusLocation }: ValidatorOptions) {
		this.isConusLocation = isConusLocation;
	}
	encoding(validSyntax) {
		const [[[taf, amd, icao, date], timperiod, firstLine], mainBody, temperatureGroup] = validSyntax;
		this._line('HEAD', firstLine);

		// this._line('HEAD', firstLine);

		return validSyntax;
	}
	_line(type: string, [wind, vis, ww, NNNhhh, ...rest]) {
		const message = '';
		const expected = [{ type: '', description: 'description' }];
		// throw new EncodingError('EncodingError', message, expected, NNNhhh.range);
	}

	times(type: string, { issued, begin, end }: TDates, range: () => ErrorLocation) {
		// ON DATE_TIME_ERROR
		const onError = (message: string, expected: Expected[]) => {
			throw new EncodingError('DateError', message, expected, range());
		};

		if (!!issued) {
			this._dv = new DateValidator(issued, begin, end, { AMD_COR: false }, onError);
		} else if (!!this._dv) {
			switch (type) {
				case 'BECMG':
					this._dv.validateBECMG(begin, end, onError);
					break;
				case 'TEMPO':
					this._dv.validateTEMPO(begin, end, (message, expected) => {
						throw new EncodingError('DateError', message, expected, range());
					});
					break;
				default:
					return;
			}
		}
	}
	line(type: string, value: any[][]) {
		console.log(value);
	}

	NNNhhh([[vvvv], [fc, ts, obsc, vc, other], NNNhhh]: NNNhhhProps, range: () => ErrorRange) {
		var tsFlag = !!ts;
		var cbFlag = false;
		const toss = (message, expected) => {
			throw new EncodingError('EncodingError', message, expected, range());
		};

		NNNhhh.reduce(
			([_hhh, _cb], [nnn, hhh, cb]) => {
				if (_hhh >= hhh) {
					const message = '';
					const expected = [{ type: '', description: 'description' }];
					toss(message, expected);
					// throw new EncodingError('EncodingError', message, expected, range);
				}

				if (cbFlag && !!cb) {
					const message = 'do not encode 2 cb flags';
					const expected = [{ type: '', description: 'description' }];
					toss(message, expected);
					// throw new EncodingError('EncodingError', message, expected, range);
				} else if (!!cb) {
					cbFlag = true;
				}
				return [hhh, cb];
			},
			[-1, false]
		);
		const needsFlags = tsFlag && !cbFlag;
		const shouldNotHaveFlags = !ts && !!cbFlag;
		// const hasCorrectFlags = !hasRequriedFlags || doesNotRequireFlags;
		if (needsFlags || shouldNotHaveFlags) {
			const message = needsFlags ? 'as CB remark is required' : 'should not have CB remark is required';
			const expected = [{ type: 'literal', text: 'CB', ignoreCase: false }];
			throw new EncodingError('EncodingError', message, expected, range());
		}

		return;
	}
}
type WWProps = [string | null, string | null, string | null, string | null, string | null];
type NNNhhhProps = [[number], WWProps, [string, number, boolean][]];
type ErrorRange = { start: number; end: number };

type Expected = { type: string; description: string } | { type: string; text: string; ignoreCase: boolean };

class EncodingError {
	name: string = 'EncodingError';
	message: string;
	expected: Expected[];
	location: ErrorLocation | ErrorRange;
	constructor(name: string, message: string, expected: Expected[], location: ErrorLocation | ErrorRange) {
		this.name = name;
		this.message = message;
		this.expected = expected;
		this.location = location;
	}
}

type TDates = {
	issued?: Date;
	begin: Date;
	end: Date;
};

type ErrorLocation = {
	end: { offset: number; line: number; column: number };
	start: { offset: number; line: number; column: number };
};
type ValidatorOptions = {
	isConusLocation: boolean;
};