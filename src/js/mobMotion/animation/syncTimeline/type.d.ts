import { directionType, directionTypeObjectLoop } from '../utils/timeline/type';
import HandleSyncTimeline from './handleSyncTimeline';

export interface syncTimelineType {
    duration?: number;
    yoyo?: boolean;
    repeat?: number;
}

export interface syncTimelineSequencers {
    draw: (arg0: {
        partial: number;
        isLastDraw: boolean;
        useFrame: boolean;
        direction: directionType;
    }) => void;
    getLabels: () => { name: string; time: number }[];
    inzializeStagger: () => void;
    disableStagger: () => void;
    cleanCachedId: () => void;
    resetLastValue: () => void;
    destroy: () => void;
    setStretchFactor: (arg0: number) => void;
}

export interface syncTimelineEventType<T> {
    id: number;
    cb: (arg0?: T) => void;
}

export type syncTimelinePlay = (arg0?: {
    useCurrent?: boolean;
}) => Promise<any>;

export type syncTimelinePlayReverse = (arg0?: {
    useCurrent?: boolean;
}) => Promise<any>;

export type syncTimelinePlayFrom = (value?: number | string) => Promise<any>;
export type syncTimelinePlayFromReverse = (
    value?: number | string
) => Promise<any>;

export type syncTimelinePause = () => void;
export type syncTimelineResume = () => void;
export type syncTimelineReverse = () => void;

export type syncTimelineStop = (arg0?: {
    clearCache?: boolean;
}) => HandleSyncTimeline;

export type syncTimelineAdd = (
    arg0: syncTimelineSequencers
) => HandleSyncTimeline;

export type syncTimelineSetDuration = (arg0: number) => HandleSyncTimeline;

export type syncTimelineIsActive = () => boolean;
export type syncTimelineIsPaused = () => boolean;
export type syncTimelineGetDirection = () => directionType;
export type syncTimelineTime = () => number;

export type syncTimelineOnLoopEnd = (
    arg0: (arg0: directionTypeObjectLoop) => void
) => () => void;

export type syncTimelineOnUpdate = (arg0: () => void) => () => void;

export type syncTimelineOnComplete = (arg0: () => void) => () => void;
