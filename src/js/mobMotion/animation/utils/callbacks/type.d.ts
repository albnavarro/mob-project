import { StaggerFrameIndexObject, StaggerObject } from '../stagger/type';

export interface CallbackObject<T> {
    cb: T;
    id: number;
    index: number;
    frame: number;
}

export type CallbackDefault = CallbackObject<
    (arg0: Record<string, number>) => void
>[];

export type CallbackCache = CallbackObject<string>[];

export interface SetCallbackReturnObject {
    arrayOfCallbackUpdated: CallbackDefault;
    unsubscribeCb: (arg0: CallbackDefault) => CallbackDefault;
}

export interface SetCallbackCacheReturnObject {
    arrayOfCallbackUpdated: CallbackCache;
    unsubscribeCache: (() => void)[];
    unsubscribeCb: (arg0: CallbackCache) => CallbackCache;
}

export type DefaultCallback = (arg0: {
    stagger: StaggerObject;
    callback: CallbackDefault;
    callbackCache: CallbackCache;
    callBackObject: Record<string, number>;
    useStagger: boolean;
}) => void;

export type DefaultCallbackOnComplete = (arg0: {
    onComplete: () => void;
    stagger: StaggerObject;
    callback: CallbackDefault;
    callbackCache: CallbackCache;
    callbackOnComplete: CallbackDefault;
    callBackObject: Record<string, number>;
    slowlestStagger: StaggerFrameIndexObject;
    fastestStagger: StaggerFrameIndexObject;
    useStagger: boolean;
}) => void;

export type SyncCallback = (arg0: {
    each: number;
    useStagger: boolean;
    isLastDraw: boolean;
    callBackObject: Record<string, number>;
    callback: CallbackDefault;
    callbackCache: CallbackCache;
    callbackOnStop: CallbackDefault;
}) => void;

export type SetCallBack = (
    currentCallback: (arg0: any) => void,
    arrayOfCallback: CallbackDefault
) => SetCallbackReturnObject;

export type SetCallBackCache = (
    item: object | HTMLElement,
    currentCallback: (arg0: any, arg1: object | HTMLElement) => void,
    arrayOfCallback: CallbackCache,
    unsubscribeCacheArray: (() => void)[]
) => SetCallbackCacheReturnObject;
