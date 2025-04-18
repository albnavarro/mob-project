import MobMasterSequencer from '../sequencer/mob-master-sequencer';
import MobSequencer from '../sequencer/mob-sequencer';
import { DirectionType, DirectionTypeObjectLoop } from '../utils/timeline/type';
import MobSyncTimeline from './mob-sync-timeline';

export interface SyncTimeline {
    duration?: number;
    yoyo?: boolean;
    repeat?: number;
}

export type SyncTimelineSequencers = MobSequencer | MobMasterSequencer;

export interface SyncTimelineEvent<T> {
    id: number;
    cb: (arg0: T) => void;
}

export type SyncTimelinePlay = (arg0?: {
    useCurrent?: boolean;
}) => Promise<any>;

export type SyncTimelinePlayReverse = (arg0?: {
    useCurrent?: boolean;
}) => Promise<any>;

export type SyncTimelinePlayFrom = (value?: number | string) => Promise<any>;
export type syncTimelinePlayFromReverse = (
    value?: number | string
) => Promise<any>;

export type SyncTimelinePause = () => void;
export type SyncTimelineResume = () => void;
export type SyncTimelineReverse = () => void;

export type SyncTimelineStop = (arg0?: {
    clearCache?: boolean;
}) => MobSyncTimeline;

export type SyncTimelineAdd = (arg0: SyncTimelineSequencers) => MobSyncTimeline;

export type SyncTimelineSetDuration = (arg0: number) => MobSyncTimeline;

export type SyncTimelineIsActive = () => boolean;
export type SyncTimelineIsPaused = () => boolean;
export type SyncTimelineGetDirection = () => DirectionType;
export type SyncTimelineTime = () => number;

export type SyncTimelineOnLoopEnd = (
    arg0: (arg0: DirectionTypeObjectLoop) => void
) => () => void;

export type SyncTimelineOnUpdate = (arg0: () => void) => () => void;

export type SyncTimelineOnComplete = (arg0: () => void) => () => void;
