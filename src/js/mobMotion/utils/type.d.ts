import { allActionType } from '../animation/utils/tweenAction/type';

export type mqAction = 'min' | 'max';
export type mqActionMethods = 'min' | 'max' | 'get';
export type mqValues =
    | 'xSmall'
    | 'small'
    | 'medium'
    | 'tablet'
    | 'desktop'
    | 'large'
    | 'xLarge';

// Tween/Spring/Lerp commone action type

export type SetData = (arg0: Record<string, number>) => void;

export type GoTo<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: T extends K ? K : T
) => ReturnType<DoAction<T>>;

export type GoFrom<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: T extends K ? K : T
) => ReturnType<DoAction<T>>;

export type GoFromTo<K> = <T extends K>(
    fromObj: Record<string, number | (() => number)>,
    toObj: Record<string, number | (() => number)>,
    props?: T extends K ? K : T
) => ReturnType<DoAction<T>>;

export type Set<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: T extends K ? K : T
) => ReturnType<DoAction<T>>;

export type DoAction<K> = (
    data: allActionType[],
    props?: K,
    obj: Record<string, number | (() => number)>
) => Promise<void>;

export type SetImmediate<K> = <T extends K>(
    obj: Record<string, number | (() => number)>,
    props?: T extends K ? K : T
) => void;

export type tweenMergeProps = (props: tweenAction) => tweenDefault;
