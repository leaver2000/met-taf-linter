
// const _MS_24_HOURS = 8.64e7
const _30_HOURS_MS = 1.08e8
const _MS_PER_HOUR = 3.6e6
const expected = [{ type: 'string', description: 'string' }];

/**
 *
 * MESSAGE HEADING:

* >**TAF (AMD or COR) CCCC YYGGggZ YYG1G1/YYG2G2 dddffGfmfmKT VVVV
w’w’ NsNsNshshshsCC or VVhshshs or SKC (VAbbbttt) (WShxhxhx/dddfffKT)
(6IchihihitL) (5BhBhBhBtL) QNHP1P1P1P1INS (Remarks)
TTTTT YYGGGeGe or YYGG/YYGeGe ddffGfmfmKT…same as above… (Remarks)
TX(M)TFTF/YYGFGFZ TN(M)TFTF/YYGFGFZ**
 */

const dateDiff = (a: Date, b: Date) => (Math.abs(a.getTime() - b.getTime()))
// const dateIsValid = () => {
//     const fromIsValid = from.getTime() >= startTime && from.getTime() <= stopTime;
//     const toIsValid = to.getTime() >= startTime && to.getTime() <= stopTime;
// }

// "FROM" AND "TO" TIME OCCUR WITHIN THE 30 HOUR TAF VALID TIME
//  IF BOTH FROM AND TO ARE VALID.... THE DATES ARE SET AND USED IN VALIDATION FOR THE NEXT LINE
export default class DateValidator {
    issued: Date;
    issuedTime: number;

    start: Date;
    startTime: number;

    stop: Date;
    stopTime: number;

    lastBECMG: { begin: Date; end: Date } | null;
    lastTEMPO: { begin: Date; end: Date } | null;

    /** "FROM" AND "TO" TIME OCCUR WITHIN THE 30 HOUR TAF PERIOD */
    _isValid(from: Date, to: Date) {
        const { startTime, stopTime } = this
        const fromTime = from.getTime()
        const toTime = to.getTime()
        const beginIsValid = fromTime >= startTime && fromTime <= stopTime;
        const endIsValid = toTime >= startTime && toTime <= stopTime;
        return beginIsValid && endIsValid
    }
    constructor(issued: Date, start: Date, stop: Date, { AMD_COR }: { AMD_COR: string | null }, onError: OnErrorProps) {
        // onError(JSON.stringify(_MS_PER_HOUR), expected)
        if (!!AMD_COR) {
            // TODO: ERROR CHECKING FOR AMD_COR 
            switch (AMD_COR) {
                case "AMD":
                    break
                case "COR":
                    break
                default:
                    break
            }

        }
        else {
            if (dateDiff(start, stop) !== _30_HOURS_MS) {
                const message = '1.3.1.1. Make all TAFs valid for a 30-hour forecast period. maybe you want to COR or AMD'
                onError(message, expected)
            }

        }

        this.issued = issued;
        this.issuedTime = issued.getTime();

        this.start = start;
        this.startTime = start.getTime();

        this.stop = stop;
        this.stopTime = stop.getTime();

        this.lastBECMG = null;
        this.lastTEMPO = null;
        // break;
    }

    /**
     * validates that the YYGG/YYGeGe occurs beteen the YYGGggZ
     *
     * @AFMAN 15-124
     * 1.3.1.1. Make all TAFs valid for a 30-hour forecast period.
     *``` code
     *
     *```
     */
    validateBECMG(begin: Date, end: Date, onError: OnErrorProps) {
        //  startTime is the validPeriod start time
        //  stopTime is the validPeriod end time
        //  lastBECMG is the cached date values for the previous BECMG group
        const { lastBECMG } = this;
        this.lastTEMPO = null;

        if (!!lastBECMG && lastBECMG.end > begin) {
            const message = 'BECMG valid times should NOT occur within the valid time of the previous BECMG line';
            onError(message, expected);
        } else if (getHourDiff(begin, end) > 2) {
            const message = 'BECMG valid times should NOT greater than 2 hours';
            onError(message, expected);
        }


        if (!this._isValid(begin, end)) {
            const message = 'BECMG Valid times should occur within the TAF validTime';
            onError(message, expected);
        } else {
            this.lastBECMG = { begin, end }
        }
    }
    validateTEMPO(begin: Date, end: Date, onError: OnErrorProps) {
        const { start, stop } = this;

        // const fromIsValid = from.getTime() >= start.getTime() && from.getTime() <= stop.getTime();
        // const toIsValid = to.getTime() >= start.getTime() && to.getTime() <= stop.getTime();
        // if (fromIsValid && toIsValid) return;
        // else
        // 	throw new DateException({
        // 		message: 'TEMPO Valid times should occur within the TAF validTime',
        // 		expected: [{ type: 'string', description: 'string' }],
        // 		found: foundUnknown,
        // 	});
    }
}

const getHourDiff = (timeOne: Date, timeTwo: Date) => (Math.abs(Math.floor((timeOne.getTime() - timeTwo.getTime()) / _MS_PER_HOUR)))



type OnErrorProps = (message: string, expected: { type: string; description: string }[]) => void;
