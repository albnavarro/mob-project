import {
    asyncTimelineAdd,
    asyncTimelineAddAsync,
    asyncTimelineCloseGroup,
    asyncTimelineCreateGroup,
    asyncTimelineGoFrom,
    asyncTimelineGoFromTo,
    asyncTimelineGoTo,
    asyncTimelineLabel,
    asyncTimelineOnComplete,
    asyncTimelineOnLoopEnd,
    asyncTimelinePause,
    asyncTimelinePlayFrom,
    asyncTimelinePlayFromReverse,
    asyncTimelinePlayReverse,
    asyncTimelineResume,
    asyncTimelineSet,
    asyncTimelineSetTween,
    asyncTimelineStop,
    asyncTimelineSuspend,
    asyncTimelineSync,
} from './animation/asyncTimeline/type';
import {
    lerpGetId,
    lerpGetType,
    lerpGetValue,
    lerpGoFrom,
    lerpGoFromTo,
    lerpGoTo,
    lerpOnComplete,
    lerpPause,
    lerpSet,
    lerpSetData,
    lerpStop,
    lerpSubscribe,
    lerpSubscribeCache,
    lerpUpdatePrecision,
    lerpUpdateVelocity,
} from './animation/lerp/type';
import {
    parallaxTweenGetDuration,
    parallaxTweenGetType,
    parallaxTweenOnStop,
    parallaxTweenSetData,
    parallaxTweenSubscribe,
    parallaxTweenSubscribeCache,
} from './animation/parallax/type';
import {
    sequencerAdd,
    sequencerGetDuration,
    sequencerGetLabels,
    sequencerGetType,
    sequencerGoFrom,
    sequencerGoFromTo,
    sequencerGoTo,
    sequencerLabel,
    sequencerOnStop,
    sequencerSetData,
    sequencerSetDuration,
    sequencerSetStretchFacor,
    sequencerSubscribe,
    sequencerSubscribeCache,
} from './animation/sequencer/type';
import {
    springGetId,
    springGetType,
    springGetValue,
    springGetValueNative,
    springGoFrom,
    springGoFromTo,
    springGoTo,
    springOnComplete,
    springPause,
    springSet,
    springSetData,
    springStop,
    springSubscribe,
    springSubscribeCache,
    springUdateConfig,
    springUdateConfigProp,
} from './animation/spring/type';
import {
    syncTimelineAdd,
    syncTimelineGetDirection,
    syncTimelineIsActive,
    syncTimelineIsPaused,
    syncTimelineOnComplete,
    syncTimelineOnLoopEnd,
    syncTimelineOnUpdate,
    syncTimelinePause,
    syncTimelinePlay,
    syncTimelinePlayFrom,
    syncTimelinePlayFromReverse,
    syncTimelinePlayReverse,
    syncTimelineResume,
    syncTimelineReverse,
    syncTimelineSetDuration,
    syncTimelineStop,
    syncTimelineTime,
} from './animation/syncTimeline/type';
import {
    tweenGetId,
    tweenGetType,
    tweenGetValue,
    tweenGetValueNative,
    tweenGoFrom,
    tweenGoFromTo,
    tweenGoTo,
    tweenOnComplete,
    tweenPause,
    tweenSet,
    tweenSetData,
    tweenStop,
    tweenSubscribe,
    tweenSubscribeCache,
    tweenUpdateEase,
} from './animation/tween/type';
import { directionType } from './animation/utils/timeline/type';

export interface Lerp {
    stop: lerpStop;
    pause: lerpPause;
    setData: lerpSetData;
    goTo: lerpGoTo;
    goFrom: lerpGoFrom;
    goFromTo: lerpGoFromTo;
    set: lerpSet;
    get: lerpGetValue;
    getInitialData: lerpGetValue;
    getFrom: lerpGetValue;
    getTo: lerpGetValue;
    getFromNativeType: lerpGetValueNative;
    getToNativeType: lerpGetValueNative;
    getType: lerpGetType;
    getId: lerpGetId;
    updateVelocity: lerpUpdateVelocity;
    updatePrecision: lerpUpdatePrecision;
    subscribe: lerpSubscribe;
    subscribeCache: lerpSubscribeCache;
    onComplete: lerpOnComplete;
    destroy: () => void;
}

export interface Spring {
    stop: springStop;
    pause: springPause;
    setData: springSetData;
    goTo: springGoTo;
    goFrom: springGoFrom;
    goFromTo: springGoFromTo;
    set: springSet;
    get: springGetValue;
    getInitialData: springGetValue;
    getFrom: springGetValue;
    getTo: springGetValue;
    getFromNativeType: springGetValueNative;
    getToNativeType: springGetValueNative;
    getType: springGetType;
    getId: springGetId;
    updateConfigProp: springUdateConfigProp;
    updateConfig: springUdateConfig;
    subscribe: springSubscribe;
    subscribeCache: springSubscribeCache;
    onComplete: springOnComplete;
    destroy: () => void;
}

export interface Tween {
    stop: tweenStop;
    pause: tweenPause;
    setData: tweenSetData;
    goTo: tweenGoTo;
    goFrom: tweenGoFrom;
    goFromTo: tweenGoFromTo;
    set: tweenSet;
    get: tweenGetValue;
    getInitialData: tweenGetValue;
    getFrom: tweenGetValue;
    getTo: tweenGetValue;
    getFromNativeType: tweenGetValueNative;
    getToNativeType: tweenGetValueNative;
    getType: tweenGetType;
    getId: tweenGetId;
    updateEase: tweenUpdateEase;
    subscribe: tweenSubscribe;
    subscribeCache: tweenSubscribeCache;
    onComplete: tweenOnComplete;
    destroy: () => void;
}

export interface AsyncTimeline {
    set: asyncTimelineSet;
    goTo: asyncTimelineGoTo;
    goFrom: asyncTimelineGoFrom;
    goFromTo: asyncTimelineGoFromTo;
    add: asyncTimelineAdd;
    addAsync: asyncTimelineAddAsync;
    sync: asyncTimelineSync;
    createGroup: asyncTimelineCreateGroup;
    closeGroup: asyncTimelineCloseGroup;
    label: asyncTimelineLabel;
    setTween: asyncTimelineSetTween;
    play: () => Promise<any>;
    playFrom: asyncTimelinePlayFrom;
    playFromReverse: asyncTimelinePlayFromReverse;
    playReverse: asyncTimelinePlayReverse;
    reverseNext: () => void;
    stop: asyncTimelineStop;
    pause: asyncTimelinePause;
    resume: asyncTimelineResume;
    suspend: asyncTimelineSuspend;
    isActive: () => boolean;
    isPaused: () => boolean;
    isSuspended: () => boolean;
    getDirection: () => directionType;
    onLoopEnd: asyncTimelineOnLoopEnd;
    onComplete: asyncTimelineOnComplete;
    destroy: () => void;
}

export interface Sequencer {
    setStretchFactor: sequencerSetStretchFacor;
    setData: sequencerSetData;
    goTo: sequencerGoTo;
    goFrom: sequencerGoFrom;
    goFromTo: sequencerGoFromTo;
    label: sequencerLabel;
    getLabels: sequencerGetLabels;
    add: sequencerAdd;
    subscribe: sequencerSubscribe;
    onStop: sequencerOnStop;
    subscribeCache: sequencerSubscribeCache;
    getDuration: sequencerGetDuration;
    setDuration: sequencerSetDuration;
    getType: sequencerGetType;
    destroy: () => void;
}

export interface ParallaxTween {
    setData: parallaxTweenSetData;
    goTo: parallaxTweenGoTo;
    subscribe: parallaxTweenSubscribe;
    onStop: parallaxTweenOnStop;
    subscribeCache: parallaxTweenSubscribeCache;
    getDuration: parallaxTweenGetDuration;
    getType: parallaxTweenGetType;
}

export interface SyncTimeline {
    play: syncTimelinePlay;
    playFrom: syncTimelinePlayFrom;
    playFromReverse: syncTimelinePlayFromReverse;
    playReverse: syncTimelinePlayReverse;
    pause: syncTimelinePause;
    resume: syncTimelineResume;
    reverse: syncTimelineReverse;
    stop: syncTimelineStop;
    add: syncTimelineAdd;
    setDuration: syncTimelineSetDuration;
    isActive: syncTimelineIsActive;
    isPaused: syncTimelineIsPaused;
    getDirection: syncTimelineGetDirection;
    getTime: syncTimelineTime;
    onLoopEnd: syncTimelineOnLoopEnd;
    onComplete: syncTimelineOnComplete;
    onUpdate: syncTimelineOnUpdate;
    destroy: () => void;
}
