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
    lerpOnComplete,
    lerpPause,
    lerpStop,
    lerpSubscribe,
    lerpSubscribeCache,
    lerpUpdatePrecision,
    lerpUpdateVelocity,
} from './animation/lerp/type';
import {
    HandleScrollerTweenGetDuration,
    HandleScrollerTweenGetType,
    HandleScrollerTweenOnStop,
    HandleScrollerTweenSetData,
    HandleScrollerTweenSubscribe,
    HandleScrollerTweenSubscribeCache,
} from './animation/scroller/type';
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
    SpringGetId,
    SpringGetType,
    SpringGetValue,
    SpringGetValueNative,
    SpringOnComplete,
    SpringPause,
    SpringStop,
    SpringSubscribe,
    SpringSubscribeCache,
    SpringUdateConfig,
    SpringUdateConfigProp,
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
    TweenGetId,
    TweenGetType,
    TweenGetValue,
    TweenGetValueNative,
    TweenOnComplete,
    TweenPause,
    TweenStop,
    TweenSubscribe,
    TweenSubscribeCache,
    TweenUpdateEase,
} from './animation/tween/type';
import { directionType } from './animation/utils/timeline/type';
import {
    GoFrom,
    GoFromTo,
    GoTo,
    Set,
    SetData,
    SetImmediate,
} from './utils/type';

export interface Lerp {
    stop: lerpStop;
    pause: lerpPause;
    setData: SetData;
    goTo: GoTo;
    goFrom: GoFrom;
    goFromTo: GoFromTo;
    set: Set;
    setImmediate: SetImmediate;
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
    stop: SpringStop;
    pause: SpringPause;
    setData: SetData;
    goTo: GoTo;
    goFrom: GoFrom;
    goFromTo: GoFromTo;
    set: Set;
    setImmediate: SetImmediate;
    get: SpringGetValue;
    getInitialData: SpringGetValue;
    getFrom: SpringGetValue;
    getTo: SpringGetValue;
    getFromNativeType: SpringGetValueNative;
    getToNativeType: SpringGetValueNative;
    getType: SpringGetType;
    getId: SpringGetId;
    updateConfigProp: SpringUdateConfigProp;
    updateConfig: SpringUdateConfig;
    subscribe: SpringSubscribe;
    subscribeCache: SpringSubscribeCache;
    onComplete: SpringOnComplete;
    destroy: () => void;
}

export interface Tween {
    stop: TweenStop;
    pause: TweenPause;
    setData: SetData;
    goTo: GoTo;
    goFrom: GoFrom;
    goFromTo: GoFromTo;
    set: Set;
    setImmediate: SetImmediate;
    get: TweenGetValue;
    getInitialData: TweenGetValue;
    getFrom: TweenGetValue;
    getTo: TweenGetValue;
    getFromNativeType: TweenGetValueNative;
    getToNativeType: TweenGetValueNative;
    getType: TweenGetType;
    getId: TweenGetId;
    updateEase: TweenUpdateEase;
    subscribe: TweenSubscribe;
    subscribeCache: TweenSubscribeCache;
    onComplete: TweenOnComplete;
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
    setData: HandleScrollerTweenSetData;
    goTo: parallaxTweenGoTo;
    subscribe: HandleScrollerTweenSubscribe;
    onStop: HandleScrollerTweenOnStop;
    subscribeCache: HandleScrollerTweenSubscribeCache;
    getDuration: HandleScrollerTweenGetDuration;
    getType: HandleScrollerTweenGetType;
    inzializeStagger: () => void;
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
