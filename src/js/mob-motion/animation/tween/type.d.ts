import { StaggerObject } from '../utils/stagger/type';

export type EaseTypes =
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

export interface TimeTweenProps {
    data: Record<string, number>;
    duration?: number;
    relative?: boolean;
    stagger?: Partial<StaggerObject>;
    ease?: EaseTypes;
}

export interface TimeTweenCommonProps {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
}

export interface TimeTweenCommonPropsTween extends TimeTweenCommonProps {
    duration?: number;
}

export interface TimeTweenAction {
    duration?: number;
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    ease?: EaseTypes;
}

export interface TimeTweenDefault {
    duration: number;
    ease: string;
    relative: boolean;
    reverse: boolean;
    immediate: boolean;
}

export interface TimeTweenStopProps {
    clearCache?: boolean;
    updateValues?: boolean;
}

export interface TimeTweenInitialData {
    prop: string;
    toValue: number;
    fromValue: number;
    currentValue: number;
    shouldUpdate: boolean;
    fromFn: () => number;
    fromIsFn: boolean;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export interface TimeTweenStoreData extends TimeTweenInitialData {
    toValueOnPause: number;
    toValProcessed: number;
}

export type TimeTweenMergeProps = (props: TimeTweenAction) => TimeTweenDefault;
export type TimeTweenStop = (arg0?: TimeTweenStopProps) => void;
export type TimeTweenPause = () => void;
export type TimeTweenResume = () => void;
export type TimeTweenResetData = () => void;
export type TimeTweenGetValue = () => Record<string, number>;
export type TimeTweenGetValueNative = () => Record<
    string,
    number | (() => number)
>;
export type TimeTweenGetType = () => string;
export type TimeTweenGetId = () => string;
export type TimeTweenUpdateEase = (arg0: EaseTypes) => void;
export type TimeTweenSubscribe = (cb: (arg0: any) => void) => () => void;
export type TimeTweenSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type TimeTweenOnComplete = (cb: (arg0: any) => void) => () => void;
