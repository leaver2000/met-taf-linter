export class TAFException {
	type = 'TAFException';
	message: string;
	expected: Expected = null;
	found: Found;
	constructor({ message, found, expected }: { message: string; found: Found; expected?: Expected }) {
		this.message = message;
		this.found = found;
		if (!!expected) this.expected = expected;
	}
}
export class DateException extends TAFException {
	type = 'DateException';
}
export type Found = {
	start: {
		offset: number;
		line: number;
		column: number;
	};
	end: {
		offset: number;
		line: number;
		column: number;
	};
};
export type Expected =
	| {
			type: string;
			description: string;
	  }[]
	| null;
