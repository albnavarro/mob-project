import { StaggerObject } from '../utils/stagger/type';

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
    data: Record<string, number>;
    duration?: number;
    relative?: boolean;
    stagger?: Partial<StaggerObject>;
    ease?: easeTypes;
}

export interface tweenCommonProps {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
}

export interface tweenCommonPropsTween extends tweenCommonProps {
    duration?: number;
}

export interface tweenAction {
    duration?: number;
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    ease?: easeTypes;
}

export interface tweenDefault {
    duration: number;
    ease: string;
    relative: boolean;
    reverse: boolean;
    immediate: boolean;
}

export interface tweenStopProps {
    clearCache?: boolean;
}

export interface tweenInitialData {
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

export interface tweenStoreData extends tweenInitialData {
    toValueOnPause: number;
    toValProcessed: number;
}

export type tweenMergeProps = (props: tweenAction) => tweenDefault;
export type tweenStop = (arg0?: tweenStopProps) => void;
export type tweenPause = () => void;
export type tweenResume = () => void;
export type tweenResetData = () => void;
export type tweenGetValue = () => Record<string, number>;
export type tweenGetValueNative = () => Record<string, number | (() => number)>;
export type tweenGetType = () => string;
export type tweenGetId = () => string;
export type tweenUpdateEase = (arg0: easeTypes) => void;
export type tweenSubscribe = (cb: (arg0: any) => void) => () => void;
export type tweenSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type tweenOnComplete = (cb: (arg0: any) => void) => () => void;
