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

export interface TweenProps {
    data: Record<string, number>;
    duration?: number;
    relative?: boolean;
    stagger?: Partial<StaggerObject>;
    ease?: EaseTypes;
}

export interface TweenCommonProps {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
}

export interface TweenCommonPropsTween extends TweenCommonProps {
    duration?: number;
}

export interface TweenAction {
    duration?: number;
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    ease?: EaseTypes;
}

export interface TweenDefault {
    duration: number;
    ease: string;
    relative: boolean;
    reverse: boolean;
    immediate: boolean;
}

export interface TweenStopProps {
    clearCache?: boolean;
}

export interface TweenInitialData {
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

export interface TweenStoreData extends TweenInitialData {
    toValueOnPause: number;
    toValProcessed: number;
}

export type TweenMergeProps = (props: TweenAction) => TweenDefault;
export type TweenStop = (arg0?: TweenStopProps) => void;
export type TweenPause = () => void;
export type TweenResume = () => void;
export type TweenResetData = () => void;
export type TweenGetValue = () => Record<string, number>;
export type TweenGetValueNative = () => Record<string, number | (() => number)>;
export type TweenGetType = () => string;
export type TweenGetId = () => string;
export type TweenUpdateEase = (arg0: EaseTypes) => void;
export type TweenSubscribe = (cb: (arg0: any) => void) => () => void;
export type TweenSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type TweenOnComplete = (cb: (arg0: any) => void) => () => void;
