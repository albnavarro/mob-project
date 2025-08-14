import { TimeTweenStopProps } from '../tween/type';
import { StaggerObject } from '../utils/stagger/type';

export interface LerpTweenProps {
    data: Record<string, number>;
    relative?: boolean;
    stagger?: Partial<StaggerObject>;
    precision?: number;
    velocity?: number;
}

export interface LerpActions {
    reverse?: boolean;
    relative?: boolean;
    immediate?: boolean;
    precision?: number;
    velocity?: number;
}

export interface LerpDefault {
    reverse: boolean;
    velocity: number;
    precision: number;
    relative: boolean;
    immediate: boolean;
}

export interface LerpInitialData {
    prop: string;
    toValue: number;
    fromValue: number;
    currentValue: number;
}

export interface LerpValues extends LerpInitialData {
    fromFn: () => number;
    fromIsFn: boolean;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export type LerpMergeProps = (props: LerpActions) => LerpDefault;
export type LerpStop = (arg0?: TimeTweenStopProps) => void;
export type LerpPause = () => void;
export type LerpResume = () => void;
export type LerpResetData = () => void;
export type LerpGetValue = () => Record<string, number>;
export type LerpGetValueNative = () => Record<string, number | (() => number)>;
export type LerpGetType = () => string;
export type LerpGetId = () => string;
export type LerpUpdateVelocity = (number) => void;
export type LerpUpdatePrecision = (number) => void;
export type LerpSubscribe = (cb: (arg0: any) => void) => () => void;
export type LerpSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;
export type LerpOnComplete = (cb: (arg0: any) => void) => () => void;
