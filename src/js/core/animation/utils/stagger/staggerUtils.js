import { handleFrame } from '../../../events/rafutils/rafUtils.js';

export const getEachByFps = (each) => {
    const eachByFps = Math.round(each * (handleFrame.getFps() / 60));

    /*
    If each is 1 but fps is too low use the original, otherwise the result is 0
    */
    return each === 1 && eachByFps === 0 ? each : eachByFps;
};
