export type directionType = 'backward' | 'forward' | 'none';

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

export interface directionTypeAsync extends directionTypeObjectLoop {
    resolve: function;
}
