import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';

export const resume = (rafFn, resolve) => {
    handleFrame.add(() => {
        handleNextTick.add(({ time, fps }) => {
            rafFn(time, fps, resolve);
        });
    });
};
