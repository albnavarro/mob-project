export interface valueToparseType {
    [key: string]: number | (() => number);
}

export interface goToParamsType {
    prop: string;
    toValue: number;
    toFn: function;
    toIsFn: boolean;
    settled: boolean;
}

export interface goFromType {
    prop: string;
    fromValue: number;
    currentValue: number;
    fromFn: function;
    fromIsFn: boolean;
    settled: boolean;
}

export interface goFromToType {
    prop: string;
    fromValue: number;
    fromFn: function;
    fromIsFn: boolean;
    toValue: number;
    toFn: function;
    toIsFn: boolean;
    currentValue: number;
    settled: boolean;
}

export interface tweenParam {
    currentValue: number;
    fromFn: function;
    fromIsFn: boolean;
    fromValue: number;
    prop: string;
    settled: boolean;
    shouldUpdate: boolean;
    toFn: number;
    toIsFn: function;
    toValProcessed: number;
    toValue: number;
    toValueOnPause: number;
}
