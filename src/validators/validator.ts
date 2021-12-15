import DateValidator from './date-validator';
const _format_hhh = (hhh: number) => {
	hhh = hhh / 100;
	return hhh < 100 ? `0${hhh}` : hhh;
};
const _shiftRange = ({ start, end }: { start: number; end: number }, o1: number, o2: number) => {
	return { start: start + o1, end: end + o2 };
};
const _TS = /TS/;
/**
 *
 * MESSAGE HEADING:
* 
>TAF (AMD or COR) CCCC YYGGggZ YYG1G1/YYG2G2 dddffGfmfmKT VVVV
w’w’ NsNsNshshshsCC or VVhshshs or SKC (VAbbbttt) (WShxhxhx/dddfffKT)
(6IchihihitL) (5BhBhBhBtL) QNHP1P1P1P1INS (Remarks)
TTTTT YYGGGeGe or YYGG/YYGeGe ddffGfmfmKT…same as above… (Remarks)
TX(M)TFTF/YYGFGFZ TN(M)TFTF/YYGFGFZ

 */
export default class Validator {
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
		return validSyntax;
	}

	_YYGGggZ(issued: Date, begin: Date, end: Date, { AMD_COR }, range: () => ErrorLocation) {
		this._dv = new DateValidator(issued, begin, end, { AMD_COR }, (message: string, expected: Expected[]) => {
			throw new DateTimeError(message, expected, range());
		});
	}

	_YYG1G1_YYG2G2(type: string, begin: Date, end: Date, range: () => ErrorLocation) {
		const onError = (message: string, expected: Expected[]) => {
			throw new DateTimeError(message, expected, range());
		};
		if (!!this._dv)
			switch (type) {
				case 'BECMG':
					this._dv.validateBECMG(begin, end, onError);
					break;
				case 'TEMPO':
					this._dv.validateTEMPO(begin, end, onError);
					break;
				default:
					return;
			}
	}
	_dddffGfmfmKT(ddd: string, ff: number, fmfm: number | null, range: () => ExceptionRange) {
		//* HAS GUST
		if (!!fmfm) {
			//* GUST ARE LESS THAN SUSTAINED
			if (ff >= fmfm) {
				const message = 'Forecast Gust Should be greater than Forecast Windspeeds';
				const expected = [{ type: '', description: 'description' }];
				throw new EncodingError(message, expected, range());
			}
			if (false) {
				//todo: IF GUST ARE WITHIN % OF OF SUSTAINED WARN
			}
		}
		const calmDDD = ff !== 0 && ddd === '000';
		const calmFF = ff === 0 && ddd !== '000';

		if (calmDDD || calmFF) {
			const message = 'When forecasting calm winds encode 00000KT';
			const expected = [{ type: 'litteral', description: '00000KT' }];
			throw new EncodingError(message, expected, range());
		}
		return [ddd, ff, fmfm];
	}
	_VVVV([VVVV], range: () => ExceptionRange) {
		const { isConusLocation } = this;
		//
		const type = 'litteral';
		if (isConusLocation && VVVV === 5000) {
			const message = 'use 5000 for state side locations';
			const description = [{ type, description: '5000' }];
			throw new EncodingError(message, description, range());
			//
		} else if (VVVV === 4800 && !isConusLocation) {
			const message = 'use 4800 for overseas locations';
			const description = [{ type, description: '4800' }];
			throw new EncodingError(message, description, range());
		}
		return [VVVV];
	}
	/** performs encoding validation on VVVV and w'w' groups
	 *
	 * ```
	 * const [ [ visibility ] [ fc precip obsc vc other ] ] = ww
	 * ```
	 * @test
	 * ```
	 * /TS/.test(ww[1]:precip)&&ww[3]:VC="VCTS"? throw Error(...):continue
	 * ```
	 * @method
	 * ```
	 * const wwLength = ww.filter((w: null | string) => w).length;
	 * ```
	 * @test
	 * ```
	 * (wwLength>3)? throw Error(...):continue
	 *
	 * ```
	 * @test
	 * ```
	 * (VVVV !== 9999 && !wwLength)? throw Error(...):continue
	 * ```
	 * */

	_VVVV_ww([[VVVV], ww]: [vvvv, ww], range: () => ExceptionRange) {
		//
		//* test ww[1] (precip) for "TS" && ww[3] (vicinity) for "VCTS" throw Error
		if (_TS.test(ww[1]) && ww[3] === 'VCTS') {
			const message = 'do not encode TSRA and VCTS in the same line';
			const description = [{ type: 'litteral', description: 'SHRA' }];
			throw new EncodingError(message, description, range());
		}

		const wwLength = ww.filter((w: null | string) => w).length;
		//* if more than three presentWeather groups are encoded throw Error
		if (wwLength > 3) {
			const message = "do not encode more than 3 w'w' groups";
			const expected = [{ type: 'SHRA', description: 'description' }];
			throw new EncodingError(message, expected, range());
		}
		//* if visibility is Not unrestricted and presentWeather is null throw Error
		if (VVVV !== 9999 && !wwLength) {
			const message = 'visiblity less than 9999 requires a visibility restrictor';
			const expected = [{ type: 'SHRA', description: 'description' }];
			throw new EncodingError(message, expected, _shiftRange(range(), -4, +1));
		}
	}

	_ww_NNNhhhCC([ww, NNNhhhCC]: NNNhhhProps, range: () => ExceptionRange) {
		// const [fc, precip, obsc, vc, other] = ww;
		const precip = ww[1];
		const vc = ww[3];

		const TSRA = !!precip ? _TS.test(precip) : !!precip;
		const VCTS = vc === 'VCTS';

		const TS_Flag = TSRA || VCTS;

		const CB_Flag = !!NNNhhhCC.reduce(
			//
			([_NNN, _hhh, _CC], [NNN, hhh, CC]) => {
				// height is greater than previous layer
				if (_hhh >= hhh) {
					const message = 'forecasted height of secondary layer should be higher than the previous layer';
					const expected = [{ type: '', description: 'description' }];
					throw new EncodingError(message, expected, range());
				}
				// if CB remark exsists on current
				// && if CB in memo'd value
				if (!!CC && !!_CC) {
					const message = 'do not encode CB remarks on multiple layers';
					const description = [
						//
						[_NNN, _format_hhh(_hhh), 'CB'].join(''),
						[NNN, _format_hhh(hhh)].join(''),
					].join(' ');
					const expected = [{ type: '', description }];
					throw new EncodingError(message, expected, range());
				}
				// return the memoized values only a true CC value is returned
				//- this catches true CC instances across multiple layers
				return [NNN, hhh, !!CC ? CC : _CC];
			},
			['', -1, false]
			// the CB_flag is popped from the returned result
		).pop();

		const shouldHaveFlag = TS_Flag && !CB_Flag;
		const shouldNotHaveFlag = !TS_Flag && CB_Flag;

		if (shouldHaveFlag || shouldNotHaveFlag) {
			const message = shouldHaveFlag ? 'as CB remark is required' : 'should not have CB remark is required';
			const expected = [{ type: 'literal', text: 'CB', ignoreCase: false }];
			throw new EncodingError(message, expected, range());
		}

		return;
	}
}
type WWProps = [string | null, string | null, string | null, string | null, string | null];
type NNNhhhProps = [WWProps, [string, number, boolean][]];
type ExceptionRange = { start: number; end: number };
type Expected = { type: string; description: string } | { type: string; text: string; ignoreCase: boolean };

class GeneralException {
	name: string = 'GeneralError';
	message: string;
	expected: Expected[];
	location: ErrorLocation | ExceptionRange;
	constructor(message: string, expected: Expected[], location: ErrorLocation | ExceptionRange) {
		this.message = message;
		this.expected = expected;
		this.location = location;
	}
}

class EncodingWarning extends GeneralException {
	name = 'EncodingWarning';
}
console.log([EncodingWarning]);
class EncodingError extends GeneralException {
	name = 'EncodingError';
}
class DateTimeError extends GeneralException {
	name = 'DateTimeError';
}

// type TDates = {
// 	AMD_COR: null | string;
// 	issued?: Date;
// 	begin: Date;
// 	end: Date;
// };

type ErrorLocation = {
	end: { offset: number; line: number; column: number };
	start: { offset: number; line: number; column: number };
};
type ValidatorOptions = {
	isConusLocation: boolean;
};
type vvvv = [number];
type ww = [fc: string, precip: string, obsc: string, vc: string, other: string];
