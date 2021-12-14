export class GeneralException {
    name = 'TAFException';
    message: string;
    expected: Expected = null;
    location: Location;

    constructor({ message, location, expected }: { message: string; location: Location; expected?: Expected }) {
        this.message = message;
        this.location = location;
        if (!!expected) this.expected = expected;
    }
}
export class DateException extends GeneralException {
    type = 'DateException';
}
export type Location = {
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
