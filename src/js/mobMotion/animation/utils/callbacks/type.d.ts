import { staggerDefaultIndex, staggerObject } from '../stagger/type';

export interface callbackObject<T> {
    cb: T;
    id: number;
    index: number;
    frame: number;
}

export interface setCallbackReturnObject {
    arrayOfCallbackUpdated: callbackObject<
        (arg0: Record<string, number>) => void
    >[];
    unsubscribeCb: (
        arg0: callbackObject<(arg0: Record<string, number>) => void>[]
    ) => callbackObject<(arg0: Record<string, number>) => void>[];
}

export interface setCallbackCacheReturnObject {
    arrayOfCallbackUpdated: callbackObject<string>[];
    unsubscribeCache: (() => void)[];
    unsubscribeCb: (arg0: callbackObject<string>[]) => callbackObject<string>[];
}

export type defaultCallback = (arg0: {
    stagger: staggerObject;
    callback: callbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: callbackObject<string>[];
    callBackObject: Record<string, number>;
    useStagger: boolean;
}) => void;

export type defaultCallbackOnComplete = (arg0: {
    onComplete: () => void;
    stagger: staggerObject;
    callback: callbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: callbackObject<string>[];
    callbackOnComplete: callbackObject<
        (arg0: Record<string, number>) => void
    >[];
    callBackObject: Record<string, number>;
    slowlestStagger: staggerDefaultIndex;
    fastestStagger: staggerDefaultIndex;
    useStagger: boolean;
}) => void;

export type syncCallback = (arg0: {
    each: number;
    useStagger: boolean;
    isLastDraw: boolean;
    callBackObject: Record<string, number>;
    callback: callbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: callbackObject<string>[];
    callbackOnStop: callbackObject<(arg0: Record<string, number>) => void>[];
}) => void;

export type setCallBack = (
    currentCallback: () => void,
    arrayOfCallback: callbackObject<(arg0: Record<string, number>) => void>[]
) => setCallbackReturnObject;

export type setCallBackCache = (
    item: object | HTMLElement,
    currentCallback: (arg0: any, arg1: object | HTMLElement) => void,
    arrayOfCallback: callbackObject<string>[],
    unsubscribeCacheArray: (() => void)[]
) => setCallbackCacheReturnObject;
