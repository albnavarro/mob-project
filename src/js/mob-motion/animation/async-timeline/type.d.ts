import { GoFrom, GoFromTo, GoTo, Set, SetImmediate } from '../../utils/type';
import { LerpActions } from '../lerp/type';
import { SpringActions } from '../spring/type';
import { TimeTweenAction } from '../tween/type';
import {
    DirectionTypeAsync,
    DirectionTypeObjectLoop,
} from '../utils/timeline/type';
import MobAsyncTimeline from './async-timeline';

export interface AsyncTimeline {
    /**
     * Reverse the direction each time the animation ends.
     */
    yoyo?: boolean;

    /**
     * How many times the animation should be repeated. -1 means that the animation will run in an infinite loop.
     */
    repeat?: number;

    /**
     * By default when a play or a playReverse is performed a `set method` is executed on each tween using the `initial
     * values` (play) or the `final values` (playReverse) to make each tween start from a 'neutral' position regardless
     * of its value current. Sets are not saved in the timeline but are temporary. If the `freeMode` property is set to
     * `true` the sets are not executed so that multiple timelines can control the same tweens always starting from the
     * current value of each tween. `The default is false`.
     */
    freeMode?: boolean;

    /**
     * If `autoSet` is set to true for each tween a `set method` corresponding to the `beginning` and `end` of the same
     * timeline will be created. The newly created methods will be `permanently` added to the ends of the timeline. As
     * these sets are permanent unlike the default behavior (with freeMode = false) during a repeat the timeline will
     * always restart from the initial (or final) value. `The default is false`
     */
    autoSet?: boolean;
}

export interface AsyncTimelineTypeSpecialProps
    extends TimeTweenAction,
        SpringActions,
        LerpActions {
    delay?: number;
}

export interface AsyncTimelineTween {
    getId: () => string;
    set: Set<LerpActions | SpringActions | TimeTweenAction>;
    setImmediate: SetImmediate<LerpActions | SpringActions | TimeTweenAction>;
    goTo: GoTo<LerpActions | SpringActions | TimeTweenAction>;
    goFrom: GoFrom<LerpActions | SpringActions | TimeTweenAction>;
    goFromTo: GoFromTo<LerpActions | SpringActions | TimeTweenAction>;
    getToNativeType: () => Record<string, number | (() => number)>;
    destroy: () => void;
    onStartInPause: (cb: () => boolean) => void;
    resetData: () => void;
    getInitialData: () => Record<string, number>;
    stop: (arg0?: { clearCache: boolean }) => any;
    pause?: () => void;
    resume?: () => void;
    isActive?: () => boolean;
    clearCurretPromise?: () => void;
}

export interface AsyncTimelineRowData {
    action: string;
    groupProps: {
        waitComplete?: boolean;
    };
    id: number;
    labelProps: { name?: string };
    prevValueSettled: boolean;
    prevValueTo: Record<string, number | (() => number)>;
    tween?: AsyncTimelineTween;
    callback: (arg0?: any) => any;
    tweenProps: AsyncTimelineTypeSpecialProps;
    valuesFrom: Record<string, number | (() => number)>;
    valuesTo: Record<string, number | (() => number)>;
}

export interface AsyncTimelineTweenItem {
    data: AsyncTimelineRowData;
    group: number | undefined;
}

export interface AsyncTimelineCurrentTween {
    uniqueId: string;
    id: number;
    tween: AsyncTimelineTween;
}

export interface AsyncTimelineTweenStore {
    id: string;
    tween: AsyncTimelineTween;
}

export interface AsyncTimelineLabelState {
    active: boolean;
    index: string | number | null;
    isReverse: boolean;
    callback: (() => void) | undefined;
}

export interface AsyncTimelineAfterReject {
    fn: () => any;
    active: boolean;
}

export interface AsyncTimelineCurrentAction {
    action: string;
    id: number;
}

export type AsyncTimelineAddToActiveTween = (
    tween: AsyncTimelineTween
) => () => void;
export type AsyncTimelineAddToMainArray = (obj: AsyncTimelineRowData) => void;
export type AsyncTimelineAddTweenToStore = (tween: AsyncTimelineTween) => void;

export type AsyncTimelineSet = (
    tween: AsyncTimelineTween,
    valuesSet: Record<string, number>,
    tweenProps?: AsyncTimelineTypeSpecialProps
) => MobAsyncTimeline;

export type AsyncTimelineGoTo = (
    tween: AsyncTimelineTween,
    valuesTo: Record<string, number | (() => number)>,
    tweenProps?: AsyncTimelineTypeSpecialProps
) => MobAsyncTimeline;

export type AsyncTimelineGoFrom = (
    tween: AsyncTimelineTween,
    valuesFrom: Record<string, number | (() => number)>,
    tweenProps?: AsyncTimelineTypeSpecialProps
) => MobAsyncTimeline;

export type AsyncTimelineGoFromTo = (
    tween: AsyncTimelineTween,
    valuesFrom: Record<string, number | (() => number)>,
    valuesTo: Record<string, number | (() => number)>,
    tweenProps?: AsyncTimelineTypeSpecialProps
) => MobAsyncTimeline;

export type AsyncTimelineAdd = (arg0: () => void) => globalThis;
export type AsyncTimelineAddAsync = (
    fn: (arg0: DirectionTypeAsync) => void
) => MobAsyncTimeline;

export type AsyncTimelineCreateGroup = (groupProps?: {
    waitComplete?: boolean;
}) => MobAsyncTimeline;

export type AsyncTimelineCloseGroup = () => MobAsyncTimeline;
export type AsyncTimelineSuspend = (fn: () => boolean) => MobAsyncTimeline;
export type AsyncTimelineLabel = (labelProps?: any) => MobAsyncTimeline;

export type AsyncTimelineSetTween = (
    label: string,
    items: any[]
) => Promise<any>;

export type AsyncTimelinePlayFromLabel = (arg0: {
    isReverse?: boolean;
    label?: string;
}) => void;

export type AsyncTimelinePlayFrom = (
    label: string
) => ReturnType<AsyncTimelinePlayUpeDown>;
export type AsyncTimelinePlayUpeDown = (
    label: string,
    isReverse: boolean
) => Promise<any>;

export type AsyncTimelinePlayReverse = (arg0?: {
    forceYoYo?: boolean;
    callback?: () => void;
    resolve?: (value: any) => void | null;
    reject?: (value: any) => void | null;
}) => Promise<any>;

export type AsyncTimelineStop = (arg0?: { clearCache?: boolean }) => void;
export type AsyncTimelinePause = () => void;
export type AsyncTimelineResume = () => void;

export type AsyncTimelineOnLoopEnd = (
    arg0: (arg0: DirectionTypeObjectLoop) => void
) => () => void;

export type AsyncTimelineOnComplete = (arg0: () => void) => () => void;
