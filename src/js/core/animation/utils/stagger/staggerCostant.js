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
 * @typedef {Object} staggerTypes
 * @prop {Object} [ stagger ] Stagger object
 * @prop {('equal'|'start'|'end'|'center')} [ stagger.type ] Stagger type for createStagger
 * @prop {number} [ stagger.each ] Interval between each stagger, the unit of measure is based on the single frame
 * @prop {boolean} [ stagger.waitComplete ] Determines if the promise will be resolved by the fastest or slowest stagger, if the value is true the promise will be resolved by the slowest stagger
 * @prop {('start'|'end'|'center'|'edges'|'random'|{x:number,y:number}|number)} [ stagger.from ] Determines the starting position of the stagger sequence, it can be an element of your choice (index: number), a string or an array {x, y} in case a grid is used
 * @prop {object} [ stagger.grid ] Grid object
 * @prop {Number} [ stagger.grid.col ] If a grid is used, it determines the number of columns of the grid used, must be greater the 1
 * @prop {Number} [ stagger.grid.row ] If a grid is used, it determines the number of columns of the grid used, must be greater the 1
 * @prop {('row'|'col'|'radial')} [ stagger.grid.direction ] If a grid is used, it determines the flow of the sequence, by columns, rows or radial
 **/

/**
 * @type { staggerTypes }
 */
export const STAGGER_DEFAULT_OBJ = {
    type: STAGGER_TYPE_EQUAL,
    each: 0,
    waitComplete: false,
    from: STAGGER_START,
    grid: {
        col: -1,
        row: -1,
        direction: DIRECTION_COL,
    },
};

export const STAGGER_DEFAULT_INDEX_OBJ = {
    index: 0,
    frame: 0,
};
