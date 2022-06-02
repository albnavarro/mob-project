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

export const STAGGER_DEFAULT_OBJ = {
    each: 0,
    waitComplete: false,
    from: 'start',
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
