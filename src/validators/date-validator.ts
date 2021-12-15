// const _MS_PER_1HOUR = 3.6e6;
const _MS_PER_2HOUR = 7.2e6;
// const _MS_24_HOURS = 8.64e7
const _MS_PER_30HOUR = 1.08e8;
const expected = [{ type: 'string', description: 'string' }];

const dateDiff = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime());

export default class DateValidator {
	issued: Date;
	issuedTime: number;

	start: Date;
	startTime: number;

	stop: Date;
	stopTime: number;

	_BECMG: { begin: Date; end: Date } | null;
	_TEMPO: { begin: Date; end: Date } | null;

	constructor(issued: Date, start: Date, stop: Date, { AMD_COR }: { AMD_COR: string | null }, onError: OnErrorProps) {
		// onError(JSON.stringify(_MS_PER_HOUR), expected)
		if (!!AMD_COR) {
			// TODO: ERROR CHECKING FOR AMD_COR
			switch (AMD_COR) {
				case 'AMD':
					break;
				case 'COR':
					break;
				default:
					break;
			}
		} else {
			if (dateDiff(start, stop) !== _MS_PER_30HOUR) {
				const message = '1.3.1.1. Make all TAFs valid for a 30-hour forecast period. maybe you want to COR or AMD';
				onError(message, expected);
			}
		}

		this.issued = issued;
		this.issuedTime = issued.getTime();

		this.start = start;
		this.startTime = start.getTime();

		this.stop = stop;
		this.stopTime = stop.getTime();

		this._BECMG = null;
		this._TEMPO = null;
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
		//  _BECMG is the cached date values for the previous BECMG group
		const { _BECMG } = this;
		this._TEMPO = null;

		if (!!_BECMG && _BECMG.end > begin) {
			const message = 'BECMG valid times should NOT occur within the valid time of the previous BECMG line';
			onError(message, expected);
		} else if (dateDiff(begin, end) > _MS_PER_2HOUR) {
			const message = 'BECMG valid times should NOT greater than 2 hours';
			onError(message, expected);
		}

		if (!this._withinPeriod(begin, end)) {
			const message = 'BECMG Valid times should occur within the TAF validTime';
			onError(message, expected);
		} else {
			this._BECMG = { begin, end };
		}
	}
	validateTEMPO(begin: Date, end: Date, onError: OnErrorProps) {
		this._TEMPO = { begin, end };
	}
	/** "FROM" AND "TO" TIME OCCUR WITHIN THE 30 HOUR TAF PERIOD */
	_withinPeriod(from: Date, to: Date) {
		const { startTime, stopTime } = this;
		const fromTime = from.getTime();
		const toTime = to.getTime();
		const beginIsValid = fromTime >= startTime && fromTime <= stopTime;
		const endIsValid = toTime >= startTime && toTime <= stopTime;
		return beginIsValid && endIsValid;
	}
}

type OnErrorProps = (message: string, expected: { type: string; description: string }[]) => void;
