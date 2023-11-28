import { staggerObjectOptional } from '../utils/stagger/type';
import { valueToparseType } from '../utils/tweenAction/type';

export type easeTypes =
    | 'easeLinear'
    | 'easeInQuad'
    | 'easeOutQuad'
    | 'easeInOutQuad'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeInQuart'
    | 'easeOutQuart'
    | 'easeInOutQuart'
    | 'easeInQuint'
    | 'easeOutQuint'
    | 'easeInOutQuint'
    | 'easeInSine'
    | 'easeOutSine'
    | 'easeInOutSine'
    | 'easeInExpo'
    | 'easeOutExpo'
    | 'easeInOutExpo'
    | 'easeInCirc'
    | 'easeOutCirc'
    | 'easeInOutCirc'
    | 'easeInElastic'
    | 'easeOutElastic'
    | 'easeInOutElastic'
    | 'easeInBack'
    | 'easeOutBack'
    | 'easeInOutBack'
    | 'easeInBounce'
    | 'easeOutBounce'
    | 'easeInOutBounce';

export interface tweenProps {
    data: valueToparseType;
    duration?: number;
    relative?: boolean;
    stagger?: staggerObjectOptional;
    ease?: easeTypes;
}

export interface tweenCommonProps {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    immediateNoPromise?: boolean;
}

export interface tweenCommonPropsTween extends tweenCommonProps {
    duration?: number;
}

export interface tweenAction {
    duration?: number;
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    immediateNoPromise?: boolean;
    ease?: easeTypes;
}

export interface tweenStopProps {
    clearCache?: boolean;
}

export interface tweenInitialData {
    prop: string;
    toValue: number | function;
    fromValue: number | function;
    currentValue: number | function;
    shouldUpdate: boolean;
    fromFn: function;
    fromIsFn: boolean;
    toFn: function;
    toIsFn: boolean;
    settled: boolean;
}

export interface tweenStoreData extends tweenInitialData {
    toValueOnPause: number | function;
    toValProcessed: number | function;
}
