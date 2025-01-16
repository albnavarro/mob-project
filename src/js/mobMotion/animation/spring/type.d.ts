import { StaggerObject } from '../utils/stagger/type';

export interface springProps {
    friction: number;
    mass: number;
    precision: number;
    tension: number;
    velocity: number;
}

export interface springPresentConfigType {
    gentle: springProps;
    wobbly: springProps;
    bounce: springProps;
    scroller: springProps;
    default: springProps;
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
    stagger?: Partial<StaggerObject>;
    config?: springChoiceConfig;
    configProps?: Partial<springProps>;
}

export interface springActions {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    config?: springChoiceConfig;
    configProps?: Partial<springProps>;
}

export interface springDefault {
    reverse: boolean;
    configProps: springProps;
    relative: boolean;
    immediate: boolean;
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
export type springUdateConfigProp = (arg0: Partial<springProps>) => void;
export type springUdateConfig = (arg0: springChoiceConfig) => void;
export type springSubscribe = (cb: (arg0: any) => void) => () => void;
export type springSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type springOnComplete = (cb: (arg0: any) => void) => () => void;
