export type backward = 'backward';
export type forward = 'forward';
export type none = 'none';

export type directionType = backward | forward | none;

export interface directionSingleObject {
    BACKWARD: 'backward';
    FORWARD: 'forward';
    NONE: 'none';
}

export interface directionTypeObject {
    direction: directionType;
}

export interface directionTypeObjectSequencer extends directionTypeObject {
    value: number;
    isForced: boolean;
}

export interface directionTypeObjectLoop extends directionTypeObject {
    loop: number;
}

export interface directionTypeObjectUpdate extends directionTypeObject {
    time: number;
}

export interface directionTypeAsync extends directionTypeObjectLoop {
    resolve: () => void;
}
