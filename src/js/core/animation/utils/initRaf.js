import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';

export const initRaf = (cbPauseArr, rafFn, pauseFn, res) => {
    handleFrame.add(() => {
        handleNextTick.add(({ time, fps }) => {
            const prevent = cbPauseArr
                .map(({ cb }) => cb())
                .some((item) => item === true);
            rafFn(time, fps, res);
            if (prevent) pauseFn();
        });
    });
};
