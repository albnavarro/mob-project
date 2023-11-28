import { staggerObjectOptional } from '../utils/stagger/type';
import { valueToparseType } from '../utils/tweenAction/type';

export interface springProps {
    friction: number;
    mass: number;
    precision: number;
    tension: number;
    velocity: number;
}

export interface springPropsOptional {
    friction?: number;
    mass?: number;
    precision?: number;
    tension?: number;
    velocity?: number;
}

export interface springPresentConfigType {
    default?: springProps;
    gentle?: springProps;
    wobbly?: springProps;
    bounce?: springProps;
    scroller?: springProps;
    default?: springProps;
    [key: string]: springProps;
}

export type springChoiceConfig =
    | 'default'
    | 'gentle'
    | 'wobbly'
    | 'bounce'
    | 'scroller';

export interface springTweenProps {
    data: valueToparseType;
    relative?: boolean;
    stagger?: staggerObjectOptional;
    config?: springChoiceConfig;
    configProp?: springPropsOptional;
}

export interface springActions {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    immediateNoPromise?: boolean;
    config?: springChoiceConfig;
    configProp?: springPropsOptional;
}

export interface springDefault {
    reverse: boolean;
    configProps: springProps;
    relative: boolean;
    immediate: boolean;
    immediateNoPromise: boolean;
}

export interface springInitialData {
    prop: string;
    toValue: number | function;
    fromValue: number | function;
    currentValue: number | function;
}

export interface springValues extends springInitialData {
    velocity: number;
    fromFn: function;
    fromIsFn: boolean;
    toFn: function;
    toIsFn: boolean;
    settled: boolean;
}
