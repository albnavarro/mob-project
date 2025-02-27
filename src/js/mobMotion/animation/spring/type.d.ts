import { StaggerObject } from '../utils/stagger/type';

export interface SpringProps {
    friction: number;
    mass: number;
    precision: number;
    tension: number;
    velocity: number;
}

export interface SpringPresentConfigType {
    gentle: SpringProps;
    wobbly: SpringProps;
    bounce: SpringProps;
    scroller: SpringProps;
    default: SpringProps;
    [key: string]: SpringProps;
}

export type SpringChoiceConfig =
    | 'default'
    | 'gentle'
    | 'wobbly'
    | 'bounce'
    | 'scroller';

export interface SpringTweenProps {
    data: Record<string, number>;
    relative?: boolean;
    stagger?: Partial<StaggerObject>;
    config?: SpringChoiceConfig;
    configProps?: Partial<SpringProps>;
}

export interface SpringActions {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    config?: SpringChoiceConfig;
    configProps?: Partial<SpringProps>;
}

export interface SpringDefault {
    reverse: boolean;
    configProps: SpringProps;
    relative: boolean;
    immediate: boolean;
}

export interface SpringInitialData {
    prop: string;
    toValue: number;
    fromValue: number;
    currentValue: number;
}

export interface SpringValues extends SpringInitialData {
    velocity: number;
    fromFn: () => number;
    fromIsFn: boolean;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export type SpringMergeProps = (props: SpringActions) => SpringDefault;
export type SpringStop = (arg0?: tweenStopProps) => void;
export type SpringPause = () => void;
export type SpringResume = () => void;
export type SpringResetData = () => void;
export type SpringGetValue = () => Record<string, number>;
export type SpringGetValueNative = () => Record<
    string,
    number | (() => number)
>;
export type SpringGetType = () => string;
export type SpringGetId = () => string;
export type SpringUdateConfigProp = (arg0: Partial<SpringProps>) => void;
export type SpringUdateConfig = (arg0: SpringChoiceConfig) => void;
export type SpringSubscribe = (cb: (arg0: any) => void) => () => void;
export type SpringSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type SpringOnComplete = (cb: (arg0: any) => void) => () => void;
