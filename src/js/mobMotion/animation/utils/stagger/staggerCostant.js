export const DIRECTION_DEFAULT = null;
export const DIRECTION_ROW = 'row';
export const DIRECTION_COL = 'col';
export const DIRECTION_RADIAL = 'radial';

export const STAGGER_START = 'start';
export const STAGGER_END = 'end';
export const STAGGER_CENTER = 'center';
export const STAGGER_EDGES = 'edges';
export const STAGGER_RANDOM = 'random';

export const MERGE_FROM_UP = 'MERGE_FROM_UP';
export const MERGE_FROM_DOWN = 'MERGE_FROM_DOWN';

export const STAGGER_TYPE_EQUAL = 'equal';
export const STAGGER_TYPE_START = 'start';
export const STAGGER_TYPE_END = 'end';
export const STAGGER_TYPE_CENTER = 'center';

/**
 * @typedef  {('equal'|'start'|'end'|'center')} staggerPropType
 */

/**
 * @typedef  {Number} staggerPropEach
 */

/**
 * @typedef  {Boolean} staggerPropWaitComplete
 */

/**
 * @typedef  {('start'|'end'|'center'|'edges'|'random'|{x:number,y:number}|number)} staggerPropFrom
 */

/**
 * @typedef  {{col:number,row:number,direction:('row'|'col'|'radial')}} staggerPropGrid
 */

/**
 * @typedef {Object} staggerTypesObject
 * @prop {staggerPropType} [ stagger.type ] Stagger type for createStagger
 * @prop {staggerPropEach} [ stagger.each ] Interval between each stagger, the unit of measure is based on the single frame
 * @prop {staggerPropWaitComplete} [ stagger.waitComplete ] Determines if the promise will be resolved by the fastest or slowest stagger, if the value is true the promise will be resolved by the slowest stagger
 * @prop {staggerPropFrom} [ stagger.from ] Determines the starting position of the stagger sequence, it can be an element of your choice (index: number), a string or an Object {x, y} in case a grid is used
 * @prop {staggerPropGrid} [ stagger.grid ] Grid object
 **/

/**
 * @typedef {Object} staggerTypes
 * @prop {staggerTypesObject} [ stagger ] Stagger object
 **/

/**
 * @type { staggerTypesObject }
 */
export const STAGGER_DEFAULT_OBJ = {
    type: STAGGER_TYPE_EQUAL,
    each: 0,
    waitComplete: false,
    from: STAGGER_START,
    grid: {
        col: 1,
        row: 1,
        direction: DIRECTION_COL,
    },
};

export const STAGGER_DEFAULT_INDEX_OBJ = {
    index: 0,
    frame: 0,
};
