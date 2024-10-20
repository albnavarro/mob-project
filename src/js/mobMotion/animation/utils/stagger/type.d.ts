import { callbackObject } from '../callbacks/type.js';

export interface staggerObject {
    /**
     * @description
     * Stagger type for createStagger
     */
    type: 'equal' | 'start' | 'end' | 'center';

    /**
     * @description
     * Interval between each stagger, the unit of measure is based on the single frame
     */
    each: number;

    /**
     * @description
     * Determines if the promise will be resolved by the fastest or slowest stagger, if the value is true the promise will be resolved by the slowest stagger
     */
    waitComplete: boolean;

    /**
     * @description
     * Determines the starting position of the stagger sequence, it can be an element of your choice (index: number), a string or an Object {x, y} in case a grid is used
     */
    from:
        | 'start'
        | 'end'
        | 'center'
        | 'edges'
        | 'random'
        | { x: number; y: number }
        | number;

    /**
     * @description
     * Grid object
     */
    grid: {
        col: number;
        row: number;
        direction: 'row' | 'col' | 'radial';
    };
}

export interface staggerObjectOptional {
    /**
     * @description
     * Stagger type for createStagger
     */
    type?: 'equal' | 'start' | 'end' | 'center';

    /**
     * @description
     * Interval between each stagger, the unit of measure is based on the single frame
     */
    each?: number;

    /**
     * @description
     * Determines if the promise will be resolved by the fastest or slowest stagger, if the value is false the promise will be resolved by the slowest stagger
     */
    waitComplete?: boolean;

    /**
     * @description
     * Determines the starting position of the stagger sequence, it can be an element of your choice (index: number), a string or an Object {x, y} in case a grid is used
     */
    from?:
        | 'start'
        | 'end'
        | 'center'
        | 'edges'
        | 'random'
        | { x: number; y: number }
        | number;

    /**
     * @description
     * Grid object
     */
    grid?: {
        col: number;
        row: number;
        direction: 'row' | 'col' | 'radial';
    };
}

export interface staggerPropiertiesObject {
    stagger: staggerObject;
}

export interface staggerDefaultIndex {
    index: number;
    frame: number;
}

export interface setStagger {
    frame: number;
    index: number;
    item: Record<string, number>;
}

export type getStagger = (arg0: {
    arrayDefault: callbackObject<(arg0: Record<string, number>) => void>[];
    arrayOnStop: callbackObject<(arg0: Record<string, number>) => void>[];
    stagger: staggerObject;
    slowlestStagger: staggerDefaultIndex;
    fastestStagger: staggerDefaultIndex;
}) => {
    staggerArray: any[];
    staggerArrayOnComplete: any[];
    fastestStagger: staggerDefaultIndex;
    slowlestStagger: staggerDefaultIndex;
};

export type setSatgger = (arg0: {
    arrayDefault: any[];
    arrayOnStop: any[];
    stagger: staggerObject;
    slowlestStagger: staggerDefaultIndex;
    fastestStagger: staggerDefaultIndex;
}) => {
    staggerArray: any[];
    staggerArrayOnComplete: any[];
    fastestStagger: staggerDefaultIndex;
    slowlestStagger: staggerDefaultIndex;
};

export type shouldInizializzeStagger = (
    each: number,
    firstRun: boolean,
    arrayToCompare1: callbackObject<any>[],
    arrayToCompare2: callbackObject<any>[]
) => boolean | undefined;

export type getStaggerArray = (
    callbackCache: callbackObject<string>[],
    callbackDefault: callbackObject<(arg0: Record<string, number>) => void>[]
) => callbackObject<string | ((arg0: Record<string, number>) => void)>[];
