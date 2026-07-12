import { AllActionType } from '../animation/utils/tween-action/type';

export type StringWithAutocomplete<T> = T | (string & Record<never, never>);

export type MqAction = 'min' | 'max';
export type MqActionMethods = 'min' | 'max' | 'get';
export type MqValues = StringWithAutocomplete<
    | 'xSmall'
    | 'small'
    | 'medium'
    | 'tablet'
    | 'desktop'
    | 'large'
    | 'xLarge'
    | 'xxLarge'
>;

// Tween/Spring/Lerp commone action type

export type SetData = (arg0: Record<string, number>) => void;

export type GoTo<K> = (
    obj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type GoFrom<K> = (
    obj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type GoFromTo<K> = (
    fromObj: Record<string, number | (() => number)>,
    toObj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type Set<K> = (
    obj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type SetImmediate<K> = (
    obj: Record<string, number | (() => number)>,
    props?: K
) => void;

export type DoAction<K> = (
    data: AllActionType[],
    obj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type tweenMergeProps = (props: tweenAction) => tweenDefault;
