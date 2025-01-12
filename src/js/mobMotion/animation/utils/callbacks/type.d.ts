import { StaggerFrameIndexObject, StaggerObject } from '../stagger/type';

export interface CallbackObject<T> {
    cb: T;
    id: number;
    index: number;
    frame: number;
}

export interface SetCallbackReturnObject {
    arrayOfCallbackUpdated: CallbackObject<
        (arg0: Record<string, number>) => void
    >[];
    unsubscribeCb: (
        arg0: CallbackObject<(arg0: Record<string, number>) => void>[]
    ) => CallbackObject<(arg0: Record<string, number>) => void>[];
}

export interface SetCallbackCacheReturnObject {
    arrayOfCallbackUpdated: CallbackObject<string>[];
    unsubscribeCache: (() => void)[];
    unsubscribeCb: (arg0: CallbackObject<string>[]) => CallbackObject<string>[];
}

export type DefaultCallback = (arg0: {
    stagger: StaggerObject;
    callback: CallbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: CallbackObject<string>[];
    callBackObject: Record<string, number>;
    useStagger: boolean;
}) => void;

export type DefaultCallbackOnComplete = (arg0: {
    onComplete: () => void;
    stagger: StaggerObject;
    callback: CallbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: CallbackObject<string>[];
    callbackOnComplete: CallbackObject<
        (arg0: Record<string, number>) => void
    >[];
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
    callback: CallbackObject<(arg0: Record<string, number>) => void>[];
    callbackCache: CallbackObject<string>[];
    callbackOnStop: CallbackObject<(arg0: Record<string, number>) => void>[];
}) => void;

export type SetCallBack = (
    currentCallback: (arg0: any) => void,
    arrayOfCallback: CallbackObject<(arg0: Record<string, number>) => void>[]
) => SetCallbackReturnObject;

export type SetCallBackCache = (
    item: object | HTMLElement,
    currentCallback: (arg0: any, arg1: object | HTMLElement) => void,
    arrayOfCallback: CallbackObject<string>[],
    unsubscribeCacheArray: (() => void)[]
) => SetCallbackCacheReturnObject;
