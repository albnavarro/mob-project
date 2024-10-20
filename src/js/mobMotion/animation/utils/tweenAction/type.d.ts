export interface goToParamsType {
    prop: string;
    toValue: number;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export interface goFromType {
    prop: string;
    fromValue: number;
    currentValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    settled: boolean;
}

export interface goFromToType {
    prop: string;
    fromValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    toValue: number;
    toFn: () => number;
    toIsFn: boolean;
    currentValue: number;
    settled: boolean;
}

export type allActionType = goToParamsType | goFromType | goFromToType;

export interface tweenParam {
    currentValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    fromValue: number;
    prop: string;
    settled: boolean;
    shouldUpdate: boolean;
    toFn: number;
    toIsFn: () => number;
    toValProcessed: number;
    toValue: number;
    toValueOnPause: number;
}
