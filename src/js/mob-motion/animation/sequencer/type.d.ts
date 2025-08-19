import { EaseTypes } from '../tween/type';
import { StaggerObject } from '../utils/stagger/type';
import {
    DirectionType,
    DirectionTypeObjectSequencer,
} from '../utils/timeline/type';
import MobSequencer from './mob-sequencer';

export interface SequencerProps {
    data: Record<string, number>;
    duration?: number;
    stagger?: Partial<StaggerObject>;
    ease?: EaseTypes;
}

export interface SequencerDefault {
    ease: EaseTypes;
    start: number;
    end: number;
}

export interface SequencerAction {
    duration?: number;
    ease?: EaseTypes;
    start?: number;
    end?: number;
}

export interface SequencerValue {
    active: boolean;
    currentValue: number;
    ease: () => void;
    fromValue: number;
    prop: string;
    settled: boolean;
    toValue: number;
}

export type PropToFind = 'toValue' | 'fromValue' | '';
export type PropToFindPartial = 'toValue' | 'fromValue';

export interface SequencerRow {
    start: number;
    end: number;
    priority: number;
    values: SequencerValue[];
    propToFind: PropToFind;
}

export interface CreateStagger<T> {
    start: number;
    end: number;
    index: number;
    item: T;
}

export interface LabelType {
    name: string;
    time: number;
}

export interface AddType {
    fn: (arg0: {
        direction: DirectionType;
        value: number;
        isForced: boolean;
    }) => void;
    time: number;
}

export interface MasterSequencerItem {
    draw: (arg0: {
        partial: number;
        isLastDraw: boolean;
        useFrame: boolean;
        direction?: DirectionType;
    }) => void;
    inzializeStagger: () => void;
    setDuration: (arg0: number) => void;
    getDuration: () => number;
    setStretchFactor: (arg0: number) => void;
    getLabels: SequencerGetLabels;
    disableStagger: () => void;
    resetLastValue: () => void;
    cleanCachedId: () => void;
    destroy: () => void;
    freezeCachedId: () => void;
    unFreezeCachedId: () => void;
}

export interface CreateSequencerType<T> {
    items: T[];
    duration?: number;
}

export type CequencerSetStretchFacor = (arg0: number) => void;

export type SequencerSetData = (arg0: Record<string, number>) => MobSequencer;

export type SequencerGoTo = (
    arg0: Record<string, number | (() => number)>,
    arg1: SequencerAction
) => MobSequencer;

export type SequencerGoFrom = (
    arg0: Record<string, number | (() => number)>,
    arg1: SequencerAction
) => MobSequencer;

export type SequencerGoFromTo = (
    arg0: Record<string, number | (() => number)>,
    arg1: Record<string, number | (() => number)>,
    arg2: SequencerAction
) => MobSequencer;

export type SequencerLabel = (arg0: string, arg0?: number) => MobSequencer;

export type SequencerGetLabels = () => LabelType[];

export type SequencerAdd = (
    arg0: (arg0: DirectionTypeObjectSequencer) => void,
    arg1: number
) => MobSequencer;

export type SequencerSubscribe = (arg0: (arg0: any) => void) => () => void;
export type SequencerOnStop = (arg0: (arg0: any) => void) => () => void;

export type SequencerSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;

export type SequencerGetDuration = () => number;
export type SequencerSetDuration = (arg0: number) => void;
export type SequencerGetType = () => string;
