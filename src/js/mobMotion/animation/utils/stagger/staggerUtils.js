import { mobCore } from '../../../../mobCore/index.js';
import {
    validateStaggerColRow,
    validateStaggerDirection,
    validateStaggerEach,
    validateStaggerFrom,
    validateStaggerType,
    validateStaggerWaitComplete,
} from '../tweenValidation.js';
import {
    DIRECTION_COL,
    STAGGER_DEFAULT_OBJ,
    STAGGER_TYPE_START,
} from './staggerCostant.js';

export const getEachByFps = (each) => {
    const { instantFps } = mobCore.store.get();
    const eachByFps = Math.round(each * (instantFps / 60));

    /*
    If each is 1 but fps is too low use the original, otherwise the result is 0
    */
    return each === 1 && eachByFps === 0 ? each : eachByFps;
};

export const getStaggerFromProps = (props) => {
    return {
        type: validateStaggerType(props?.stagger?.type)
            ? props.stagger.type
            : STAGGER_DEFAULT_OBJ.type,

        each: validateStaggerEach(props?.stagger?.each)
            ? props.stagger.each
            : STAGGER_DEFAULT_OBJ.each,
        //
        from: validateStaggerFrom(props?.stagger?.from)
            ? props?.stagger?.from
            : STAGGER_TYPE_START,
        //
        grid: {
            col: validateStaggerColRow(props?.stagger?.grid?.col)
                ? props.stagger.grid.col
                : STAGGER_DEFAULT_OBJ.grid.col,
            //
            row: validateStaggerColRow(props?.stagger?.grid?.row)
                ? props.stagger.grid.row
                : STAGGER_DEFAULT_OBJ.grid.row,
            //
            direction: validateStaggerDirection(props?.stagger?.grid?.direction)
                ? props.stagger.grid.direction
                : DIRECTION_COL,
        },
        //
        waitComplete: validateStaggerWaitComplete(props?.stagger?.waitComplete)
            ? props.stagger.waitComplete
            : STAGGER_DEFAULT_OBJ.waitComplete,
    };
};

export const getStaggerArray = (arr1, arr2) => {
    return arr1.length > arr2.length ? arr1 : arr2;
};
