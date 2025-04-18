export interface GoToParamsType {
    prop: string;
    toValue: number;
    toFn: () => number;
    toIsFn: boolean;
    settled: boolean;
}

export interface GoFromType {
    prop: string;
    fromValue: number;
    currentValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    settled: boolean;
}

export interface GoFromToType {
    prop: string;
    fromValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    toValue: number;
    toFn: () => number;
    toIsFn: boolean;
    currentValue: number;
    settled: boolean;
}

export type AllActionType = GoToParamsType | GoFromType | GoFromToType;

export interface TweenParam {
    currentValue: number;
    fromFn: () => number;
    fromIsFn: boolean;
    fromValue: number;
    prop: string;
    settled: boolean;
    shouldUpdate: boolean;
    toFn: number;
    toIsFn: () => number;
    toValProcessed: number;
    toValue: number;
    toValueOnPause: number;
}

/**
 * Merge tween data Mapped type. Merge Type with TargetType
 */
type MergetTweenReturnType<Type, TargetType> = {
    [Property in keyof Type]: TargetType[Property];
};

export type MergeTweenData = <T extends Record<'prop', any>[]>(
    newData: AllActionType[],
    data: T
) => MergetTweenReturnType<AllActionType[], T>;

/**
 * Set Relative Spring & Lerp
 */
interface RequiredCommonTweenField {
    fromValue: number;
    toValue: number;
    currentValue: number;
    settled: boolean;
    prop: string;
}

type SetRelative = <T extends Record<string, any>>(
    arr: (RequiredCommonTweenField & T)[],
    relative: boolean
) => (RequiredCommonTweenField & T)[];

/**
 * Set Relative Tween
 */
export interface RequiredTwenFileds {
    currentValue: number;
    fromValue: number;
    settled: boolean;
    shouldUpdate: boolean;
    toValProcessed: number;
    toValue: number;
}

export type SetRelativeTween = <T extends Record<string, any>>(
    arr: (RequiredTwenFileds & T)[],
    relative: boolean
) => (RequiredTwenFileds & T)[];

/**
 * Update tween value from another.
 */
export type UpdateTweenValue = <T extends Record<string, any>>(
    arr: (RequiredCommonTweenField & T)[]
) => (RequiredCommonTweenField & T)[];

/**
 * Reverse tween value: froValue => toValue & toValue => fromValue
 */
export interface SetReverseValueReuiredProps {
    fromValue: number;
    toValue: number;
}

export type SetReverseValues = <
    O extends Record<'prop', any>,
    T extends Record<string, any>,
>(
    obj: O,
    arr: (SetReverseValueReuiredProps & T)[]
) => (SetReverseValueReuiredProps & T)[];
