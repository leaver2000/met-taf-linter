import DateValidator from './date-validator'
const TSRA = ["-TSRA", "TSRA", "+TSRA"]

export default class Validator2 {
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
        // const [[[taf, amd, icao, date], timperiod, firstLine], mainBody, temperatureGroup] = validSyntax;
        // this._line('HEAD', firstLine);

        // this._line('HEAD', firstLine);

        return validSyntax;
    }
    _line(type: string, [wind, vis, ww, NNNhhh, ...rest]) {
        const message = '';
        const expected = [{ type: '', description: 'description' }];
        // throw new EncodingError('EncodingError', message, expected, NNNhhh.range);
    }

    timeGroup(type: string, { issued, begin, end, AMD_COR }: TDates, range: () => ErrorLocation) {
        // ON DATE_TIME_ERROR
        const onError = (message: string, expected: Expected[]) => {
            throw new DateTimeError(message, expected, range());
        };

        if (!!issued) {
            this._dv = new DateValidator(issued, begin, end, { AMD_COR }, onError);
        } else if (!!this._dv) {
            switch (type) {
                case 'BECMG':
                    this._dv.validateBECMG(begin, end, onError);
                    break;
                case 'TEMPO':
                    this._dv.validateTEMPO(begin, end, (message, expected) => {
                        throw new DateTimeError(message, expected, range());
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
    windGroup(ddd: string, ff: number, fmfm: number | null, range: () => ErrorRange) {
        // HAS GUST 
        if (!!fmfm) {
            //GUST ARE LESS THAN SUSTAINED
            if (ff >= fmfm) {
                const message = 'Forecast Gust Should be greater than Forecast Windspeeds';
                const expected = [{ type: '', description: 'description' }];
                throw new EncodingError(message, expected, range());
            }
            if (false) {

            }

        }
        const calmDDD = ff !== 0 && ddd === '000'
        const calmFF = ff === 0 && ddd !== '000'

        if (calmDDD || calmFF) {
            const message = 'When forecasting calm winds encore 00000KT';
            const expected = [{ type: 'litteral', description: '00000KT' }];
            throw new EncodingError(message, expected, range())
        }

    }
    VVVVww([[vvvv], ww], range: () => ErrorRange) {
        if (vvvv !== 9999 && !ww.filter(w => w).length) {
            const message = 'visiblity less than 9999 requires a visibility restrictor';
            const expected = [{ type: '', description: 'description' }];
            var { start, end } = range()
            start = start - 4
            end = end + 1
            throw new EncodingError(message, expected, { start, end })
            // toss(message, expected);

        }
    }
    NNNhhh([ww, NNNhhh]: NNNhhhProps, range: () => ErrorRange) {
        const [fc, precip, obsc, vc, other] = ww
        const toss = (message, expected) => {
            throw new EncodingError(message, expected, range());
        };
        var TSRA = !!precip ? /TS/.test(precip) : !!precip;
        var VCTS = vc === "VCTS"


        if (TSRA && VCTS) {
            const message = 'do not encode TSRA and VCTS in the same line';
            const expected = [{ type: '', description: 'description' }];
            toss(message, expected);
        }



        var tsFlag = TSRA || VCTS



        var cbFlag = false;



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
        const shouldNotHaveFlags = !tsFlag && !!cbFlag;
        // const hasCorrectFlags = !hasRequriedFlags || doesNotRequireFlags;

        if (needsFlags || shouldNotHaveFlags) {
            const message = needsFlags ? 'as CB remark is required' : 'should not have CB remark is required';
            const expected = [{ type: 'literal', text: 'CB', ignoreCase: false }];
            throw new EncodingError(message, expected, range());
        }

        return;
    }
}
type WWProps = [string | null, string | null, string | null, string | null, string | null];
type NNNhhhProps = [WWProps, [string, number, boolean][]];
type ErrorRange = { start: number; end: number };

type Expected = { type: string; description: string } | { type: string; text: string; ignoreCase: boolean };

class GeneralException {
    name: string = 'GeneralError';
    message: string;
    expected: Expected[];
    location: ErrorLocation | ErrorRange;
    constructor(message: string, expected: Expected[], location: ErrorLocation | ErrorRange) {
        this.message = message;
        this.expected = expected;
        this.location = location;
    }
}

class EncodingWarning extends GeneralException { name = 'EncodingWarning' }
class EncodingError extends GeneralException { name = 'EncodingError' }
class DateTimeError extends GeneralException { name = 'DateTimeError' }



type TDates = {
    AMD_COR: null | string
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
