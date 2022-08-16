import { frameStore } from '../../../events/rafutils/frameStore.js';
import { DIRECTION_COL } from './staggerCostant.js';

export const getEachByFps = (each) => {
    const { instantFps } = frameStore.get();
    const eachByFps = Math.round(each * (instantFps / 60));

    /*
    If each is 1 but fps is too low use the original, otherwise the result is 0
    */
    return each === 1 && eachByFps === 0 ? each : eachByFps;
};

export const getStaggerFromProps = (props) => {
    return {
        each: props?.stagger?.each ? props.stagger.each : 0,
        from: props?.stagger?.from ? props.stagger.from : 'start',
        grid: {
            col: props?.stagger?.grid?.col ? props.stagger.grid.col : -1,
            row: props?.stagger?.grid?.row ? props.stagger.grid.row : -1,
            direction: props?.stagger?.grid?.direction
                ? props.stagger.grid.direction
                : DIRECTION_COL,
        },
        waitComplete: props?.stagger?.waitComplete
            ? props.stagger.waitComplete
            : false,
    };
};

export const getStaggerArray = (arr1, arr2) => {
    return arr1.length > arr2.length ? arr1 : arr2;
};
