import { staggerObjectOptional } from '../utils/stagger/type';

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
    data: Record<string, number>;
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
    toValue: number;
    fromValue: number;
    currentValue: number;
}

export interface springValues extends springInitialData {
    velocity: number;
    fromFn: () => number;
    fromIsFn: boolean;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export type springSetData = (arg0: Record<string, number>) => void;

export type springGoTo = (
    obj: Record<string, number | (() => number)>,
    props: springActions
) => void | Promise<any>;

export type springGoFrom = (
    obj: Record<string, number | (() => number)>,
    props: springActions
) => void | Promise<any>;

export type springGoFromTo = (
    fromObj: Record<string, number | (() => number)>,
    toObj: Record<string, number | (() => number)>,
    props: springActions
) => void | Promise<any>;

export type springSet = (
    obj: Record<string, number | (() => number)>,
    props: springActions
) => void | Promise<any>;

export type springDoAction = (
    data: (goToParamsType | goFromType | goFromToType)[],
    props: springActions,
    obj: Record<string, number | (() => number)>
) => void | Promise<any>;

export type springMergeProps = (props: springActions) => springDefault;

export type springStop = (arg0?: tweenStopProps) => void;
export type springPause = () => void;
export type springResume = () => void;
export type springResetData = () => void;
export type springGetValue = () => Record<string, number>;
export type springGetValueNative = () => Record<
    string,
    number | (() => number)
>;
export type springGetType = () => string;
export type springGetId = () => string;
export type springUdateConfigProp = (arg0: springPropsOptional) => void;
export type springUdateConfig = (arg0: springChoiceConfig) => void;
export type springSubscribe = (cb: () => void) => () => void;
export type springSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type springOnComplete = (cb: () => void) => () => void;
