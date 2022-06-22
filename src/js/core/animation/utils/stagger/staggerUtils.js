import { handleFrame } from '../../../events/rafutils/rafUtils.js';
import { DIRECTION_COL } from './staggerCostant.js';

export const getEachByFps = (each) => {
    const eachByFps = Math.round(each * (handleFrame.getFps() / 60));

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
    };
};
