import React from 'react';
import { tafParser } from '../parsers';
import { Validator } from '../validators';

type ParseState = {
	tafString: string | any;
	date: Date;
	success: null | any;
	error: null | any;
};
const sampleTaf = `\
TAF KADW 280100Z 0701/0807 01010KT 8000 TSRA BKN030CB QNH2902INS
BECMG 0704/0705 01015G17KT 9999 BKN020 BKN025 QNH2902INS
BECMG 0705/0706 VRB06KT 9999 BKN020 QNH2902INS TX13/0421Z TNM03/0508Z\
`;
export function useParser() {
	const [{ success, error, tafString, date }, setParserState] = React.useState<ParseState>({
		//
		success: null,
		error: null,
		tafString: sampleTaf,
		date: new Date(),
	}); //

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
		(success, error) => {
			// sets the error state for pass and failure
			setParserState(({ ...oldState }) => ({ ...oldState, success, error }));
			if (!!error) {
				const { start, end } = error.location;
				const arrayOfStrings = (function (type) {
					switch (type) {
						case 'DateTimeError':
						case 'EncodingError':
							return [type, ...splitError(tafString, start, end)];

						case 'SyntaxError':
							return [type, ...splitError2(tafString, start.offset)];

						default:
							break;
					}
				})(error.name);

				setErrorString(arrayOfStrings);
			} else {
				setErrorString(null);
			}
		},
		[tafString]
	);

	const validate = React.useMemo(() => new Validator({ isConusLocation: false }), []);
	React.useEffect(() => {
		try {
			const success = tafParser.parse(tafString.toUpperCase(), {
				...utcDateValues,
				validate,
			});
			onChange(success, null);
		} catch (e) {
			onChange(null, e);
		}
	}, [tafString, date, onChange, utcDateValues, validate]);

	return { success, error, tafString, setParserState, errorString };
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

// class Validator2 {
//     isConusLocation = false;
//     begin: Date | undefined;
//     beginTime: number | undefined;
//     end: Date | undefined;
//     endTime: number | undefined;
//     _dv: DateValidator | undefined;

//     constructor({ isConusLocation }: ValidatorOptions) {
//         this.isConusLocation = isConusLocation;
//     }
//     encoding(validSyntax) {
//         // const [[[taf, amd, icao, date], timperiod, firstLine], mainBody, temperatureGroup] = validSyntax;
//         // this._line('HEAD', firstLine);

//         // this._line('HEAD', firstLine);

//         return validSyntax;
//     }
//     _line(type: string, [wind, vis, ww, NNNhhh, ...rest]) {
//         const message = '';
//         const expected = [{ type: '', description: 'description' }];
//         // throw new EncodingError('EncodingError', message, expected, NNNhhh.range);
//     }

//     timeGroup(type: string, { issued, begin, end, AMD_COR }: TDates, range: () => ErrorLocation) {
//         // ON DATE_TIME_ERROR
//         const onError = (message: string, expected: Expected[]) => {
//             throw new DateTimeError(message, expected, range());
//         };

//         if (!!issued) {
//             this._dv = new DateValidator(issued, begin, end, { AMD_COR }, onError);
//         } else if (!!this._dv) {
//             switch (type) {
//                 case 'BECMG':
//                     this._dv.validateBECMG(begin, end, onError);
//                     break;
//                 case 'TEMPO':
//                     this._dv.validateTEMPO(begin, end, (message, expected) => {
//                         throw new DateTimeError(message, expected, range());
//                     });
//                     break;
//                 default:
//                     return;
//             }
//         }
//     }
//     line(type: string, value: any[][]) {
//         console.log(value);
//     }
//     windGroup(ddd: string, ff: number, fmfm: number | null, range: () => ErrorRange) {
//         // HAS GUST
//         if (!!fmfm) {
//             //GUST ARE LESS THAN SUSTAINED
//             if (ff >= fmfm) {
//                 const message = 'Forecast Gust Should be greater than Forecast Windspeeds';
//                 const expected = [{ type: '', description: 'description' }];
//                 throw new EncodingError(message, expected, range());
//             }
//             if (false) {

//             }

//         }
//         const calmDDD = ff !== 0 && ddd === '000'
//         const calmFF = ff === 0 && ddd !== '000'

//         if (calmDDD || calmFF) {
//             const message = 'When forecasting calm winds encore 00000KT';
//             const expected = [{ type: 'litteral', description: '00000KT' }];
//             throw new EncodingError(message, expected, range())
//         }

//     }
//     NNNhhh([[vvvv], [fc, ts, obsc, vc, other], NNNhhh]: NNNhhhProps, range: () => ErrorRange) {
//         var tsFlag = !!ts;
//         var cbFlag = false;
//         const toss = (message, expected) => {
//             throw new EncodingError(message, expected, range());
//         };

//         NNNhhh.reduce(
//             ([_hhh, _cb], [nnn, hhh, cb]) => {
//                 if (_hhh >= hhh) {
//                     const message = '';
//                     const expected = [{ type: '', description: 'description' }];
//                     toss(message, expected);
//                     // throw new EncodingError('EncodingError', message, expected, range);
//                 }

//                 if (cbFlag && !!cb) {
//                     const message = 'do not encode 2 cb flags';
//                     const expected = [{ type: '', description: 'description' }];
//                     toss(message, expected);
//                     // throw new EncodingError('EncodingError', message, expected, range);
//                 } else if (!!cb) {
//                     cbFlag = true;
//                 }
//                 return [hhh, cb];
//             },
//             [-1, false]
//         );
//         const needsFlags = tsFlag && !cbFlag;
//         const shouldNotHaveFlags = !ts && !!cbFlag;
//         // const hasCorrectFlags = !hasRequriedFlags || doesNotRequireFlags;
//         if (needsFlags || shouldNotHaveFlags) {
//             const message = needsFlags ? 'as CB remark is required' : 'should not have CB remark is required';
//             const expected = [{ type: 'literal', text: 'CB', ignoreCase: false }];
//             throw new EncodingError(message, expected, range());
//         }

//         return;
//     }
// }
// type NNNhhhProps = [[number], WWProps, [string, number, boolean][]];
// type WWProps = [string | null, string | null, string | null, string | null, string | null];
// type ErrorRange = { start: number; end: number };

// type Expected = { type: string; description: string } | { type: string; text: string; ignoreCase: boolean };

// class GeneralException {
//     name: string = 'GeneralError';
//     message: string;
//     expected: Expected[];
//     location: ErrorLocation | ErrorRange;
//     constructor(message: string, expected: Expected[], location: ErrorLocation | ErrorRange) {
//         this.message = message;
//         this.expected = expected;
//         this.location = location;
//     }
// }

// class EncodingWarning extends GeneralException { name = 'EncodingWarning' }
// class EncodingError extends GeneralException { name = 'EncodingError' }
// class DateTimeError extends GeneralException { name = 'DateTimeError' }

// type TDates = {
//     AMD_COR: null | string
//     issued?: Date;
//     begin: Date;
//     end: Date;
// };

// type ErrorLocation = {
//     end: { offset: number; line: number; column: number };
//     start: { offset: number; line: number; column: number };
// };
// type ValidatorOptions = {
//     isConusLocation: boolean;
// };
