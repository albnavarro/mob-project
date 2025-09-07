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

export type GoTo<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: K
) => ReturnType<DoAction<T>>;

export type GoFrom<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: K
) => ReturnType<DoAction<T>>;

export type GoFromTo<K> = <T extends K>(
    fromObj: Record<string, number | (() => number)>,
    toObj: Record<string, number | (() => number)>,
    props?: K
) => ReturnType<DoAction<T>>;

export type Set<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: K
) => ReturnType<DoAction<T>>;

export type DoAction<K> = (
    data: AllActionType[],
    obj: Record<string, number | (() => number)>,
    props?: K
) => Promise<void>;

export type SetImmediate<K> = (
    obj: Record<string, number | (() => number)>,
    props?: K
) => void;

export type tweenMergeProps = (props: tweenAction) => tweenDefault;
