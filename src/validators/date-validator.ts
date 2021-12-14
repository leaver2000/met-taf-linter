import { DateException } from '../exceptions';

const HOURS = {
    thirty: 1.08e8,
    twentyFour: 8.64e7,
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
/**
 *
 * MESSAGE HEADING:

* >**TAF (AMD or COR) CCCC YYGGggZ YYG1G1/YYG2G2 dddffGfmfmKT VVVV
w’w’ NsNsNshshshsCC or VVhshshs or SKC (VAbbbttt) (WShxhxhx/dddfffKT)
(6IchihihitL) (5BhBhBhBtL) QNHP1P1P1P1INS (Remarks)
TTTTT YYGGGeGe or YYGG/YYGeGe ddffGfmfmKT…same as above… (Remarks)
TX(M)TFTF/YYGFGFZ TN(M)TFTF/YYGFGFZ**

 */
const expected = [{ type: 'string', description: 'string' }];
export default class DateValidator {
    start: Date;
    startTime: number;

    stop: Date;
    stopTime: number;

    lastBECMG: { begin: Date; end: Date } | null;
    lastTEMPO: { begin: Date; end: Date } | null;

    location: () => void;

    // issued: Date;
    constructor([issued, start, stop]: [Date, Date, Date], { AMD_COR }: { AMD_COR: boolean }, location: () => void) {
        this.start = start;
        this.startTime = start.getTime();

        this.stop = stop;
        this.stopTime = stop.getTime();

        this.lastBECMG = null;
        this.lastTEMPO = null;

        this.location = location;

        if (!!AMD_COR) {
        } else this.__init_standard();

        return;
    }
    __init_standard() {
        const { startTime, stopTime } = this;
        if (stopTime - startTime === HOURS.thirty) return;
        // if the taf is not valid for exactly 30hours throw DateException
        // throw new DateException({
        // 	message: '1.3.1.1. Make all TAFs valid for a 30-hour forecast period. maybe you want to COR or AMD',
        // 	expected: [{ type: 'string', description: 'string' }],
        // 	found: '',
        // });
    }
    __init_non_standard() {
        const { startTime, stopTime } = this;
        if (startTime - stopTime > HOURS.thirty) {
        }
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
    validateBECMG([from, to]: [Date, Date], onError: ({ message, expected }) => void) {
        const { startTime, stopTime, lastBECMG } = this;
        this.lastTEMPO = null;

        if (!!lastBECMG && lastBECMG.end > from) {
            const message = 'BECMG valid times should NOT occur within the valid time of the previous BECMG line';
            onError({ message, expected });
        }

        // "FROM" AND "TO" TIME OCCUR WITHIN THE 30 HOUR TAF VALID TIME
        const fromIsValid = from.getTime() >= startTime && from.getTime() <= stopTime;
        const toIsValid = to.getTime() >= startTime && to.getTime() <= stopTime;

        // IF BOTH FROM AND TO ARE VALID....
        // THE DATES ARE SET AND USED IN VALIDATION FOR THE NEXT LINE
        if (fromIsValid && toIsValid) this.lastBECMG = { begin: from, end: to };
        else {
            const message = 'BECMG Valid times should occur within the TAF validTime';
            onError({ message, expected });
        }
    }
    validateTEMPO([from, to]: [Date, Date]) {
        const { start, stop } = this;

        const fromIsValid = from.getTime() >= start.getTime() && from.getTime() <= stop.getTime();
        const toIsValid = to.getTime() >= start.getTime() && to.getTime() <= stop.getTime();
        if (fromIsValid && toIsValid) return;
        // else
        // 	throw new DateException({
        // 		message: 'TEMPO Valid times should occur within the TAF validTime',
        // 		expected: [{ type: 'string', description: 'string' }],
        // 		found: foundUnknown,
        // 	});
    }
}
// export {};
