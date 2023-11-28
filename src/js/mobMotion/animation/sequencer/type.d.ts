import { easeTypes } from '../tween/type';
import { staggerObjectOptional } from '../utils/stagger/type';
import { valueToparseType } from '../utils/tweenAction/type';

export interface sequencerProps {
    data: valueToparseType;
    duration?: number;
    stagger?: staggerObjectOptional;
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
    ease: function;
    fromValue: number;
    prop: string;
    settled: boolean;
    toValue: number;
}

export interface sequencerRow {
    start: number;
    end: number;
    values: sequencerValue[];
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
    fn: function;
    time: number;
}

export interface masterSequencerItem {
    draw: function;
    inzializeStagger: function;
    setDuration: function;
    getDuration: function;
    setStretchFactor: function;
    getLabels: function;
    disableStagger: function;
    resetLastValue: function;
    cleanCachedId: function;
    destroy: function;
}

export interface createSequencerType {
    items: Array<HTMLElement | Object>;
    duration?: number;
}
