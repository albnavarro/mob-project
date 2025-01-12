import { easeTypes } from '../tween/type';
import { StaggerObjectOptional } from '../utils/stagger/type';
import { directionType } from '../utils/timeline/type';
import HandleSequencer from './handleSequencer';

export interface sequencerProps {
    data: Record<string, number>;
    duration?: number;
    stagger?: StaggerObjectOptional;
    ease?: easeTypes;
}

export interface sequencerDefault {
    ease: easeTypes;
    start: number;
    end: number;
}

export interface sequencerAction {
    duration?: number;
    ease?: easeTypes;
    start?: number;
    end?: number;
}

export interface sequencerValue {
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

export interface sequencerRow {
    start: number;
    end: number;
    priority: number;
    values: sequencerValue[];
    propToFind: PropToFind;
}

export interface createStagger {
    start: number;
    end: number;
    index: number;
    item: HTMLElement | object;
}

export interface labelType {
    name: string;
    time: number;
}

export interface addType {
    fn: (arg0: {
        direction: directionType;
        value: number;
        isForced: boolean;
    }) => void;
    time: number;
}

export interface masterSequencerItem {
    draw: (arg0: {
        partial: number;
        isLastDraw: boolean;
        useFrame: boolean;
        direction?: directionType;
    }) => void;
    inzializeStagger: () => void;
    setDuration: (arg0: number) => void;
    getDuration: () => number;
    setStretchFactor: (arg0: number) => void;
    getLabels: sequencerGetLabels;
    disableStagger: () => void;
    resetLastValue: () => void;
    cleanCachedId: () => void;
    destroy: () => void;
}

export interface createSequencerType {
    items: (HTMLElement | object)[];
    duration?: number;
}

export type sequencerSetStretchFacor = (arg0: number) => void;

export type sequencerSetData = (
    arg0: Record<string, number>
) => HandleSequencer;

export type sequencerGoTo = (
    arg0: Record<string, number | (() => number)>,
    arg1: sequencerAction
) => HandleSequencer;

export type sequencerGoFrom = (
    arg0: Record<string, number | (() => number)>,
    arg1: sequencerAction
) => HandleSequencer;

export type sequencerGoFromTo = (
    arg0: Record<string, number | (() => number)>,
    arg1: Record<string, number | (() => number)>,
    arg2: sequencerAction
) => HandleSequencer;

export type sequencerLabel = (arg0: string, arg0?: number) => HandleSequencer;

export type sequencerGetLabels = () => labelType[];

export type sequencerAdd = (
    arg0: (directionTypeObjectSequencer) => void,
    arg1: number
) => HandleSequencer;

export type sequencerSubscribe = (arg0: () => void) => () => void;
export type sequencerOnStop = (arg0: () => void) => () => void;

export type sequencerSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;

export type sequencerGetDuration = () => number;
export type sequencerSetDuration = (arg0: number) => void;
export type sequencerGetType = () => string;
