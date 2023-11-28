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
     * Determines if the promise will be resolved by the fastest or slowest stagger, if the value is true the promise will be resolved by the slowest stagger
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
    item: { [key: string]: number };
}
