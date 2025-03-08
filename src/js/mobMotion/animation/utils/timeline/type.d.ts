export type Backward = 'backward';
export type Forward = 'forward';
export type None = 'none';

export type DirectionType = Backward | Forward | None;

export interface DirectionSingleObject {
    BACKWARD: 'backward';
    FORWARD: 'forward';
    NONE: 'none';
}

export interface DirectionTypeObject {
    direction: DirectionType;
}

export interface DirectionTypeObjectSequencer extends DirectionTypeObject {
    value: number;
    isForced: boolean;
}

export interface DirectionTypeObjectLoop extends DirectionTypeObject {
    loop: number;
}

export interface DirectionTypeObjectUpdate extends DirectionTypeObject {
    time: number;
}

export interface DirectionTypeAsync extends DirectionTypeObjectLoop {
    resolve: () => void;
}
