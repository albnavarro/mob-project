import { staggerObjectOptional } from '../utils/stagger/type';
import { valueToparseType } from '../utils/tweenAction/type';

export interface lerpTweenProps {
    data: valueToparseType;
    relative?: boolean;
    stagger?: staggerObjectOptional;
    precision?: number;
    velocity?: number;
}

export interface lerpActions {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    immediateNoPromise?: boolean;
    precision?: number;
    velocity?: number;
}

export interface lerpDefault {
    reverse: boolean;
    velocity: number;
    precision: number;
    relative: boolean;
    immediate: boolean;
    immediateNoPromise: boolean;
}

export interface lerpInitialData {
    prop: string;
    toValue: number | function;
    fromValue: number | function;
    currentValue: number | function;
}

export interface lerpValues extends lerpInitialData {
    fromFn: function;
    fromIsFn: boolean;
    toFn: function;
    toIsFn: boolean;
    settled: boolean;
}
