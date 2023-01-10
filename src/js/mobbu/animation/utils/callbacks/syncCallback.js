import { handleFrame } from '../../../events/rafutils/handleFrame.js';
import { handleCache } from '../../../events/rafutils/handleCache.js';
import { handleFrameIndex } from '../../../events/rafutils/handleFrameIndex.js';

export const syncCallback = ({
    each,
    useStagger,
    isLastDraw,
    cbObject,
    callback,
    callbackCache,
    callbackOnStop,
}) => {
    if (each === 0 || useStagger === false) {
        handleFrame.add(() => {
            callback.forEach(({ cb }) => cb(cbObject));
        });

        handleFrame.add(() => {
            callbackCache.forEach(({ cb }) => {
                handleCache.fireObject({ id: cb, obj: cbObject });
            });
        });
    } else {
        // Stagger
        callback.forEach(({ cb, frame }) => {
            handleFrameIndex.add(() => cb(cbObject), frame);
        });

        callbackCache.forEach(({ cb, frame }) => {
            handleCache.update({ id: cb, cbObject, frame });
        });
    }

    if (isLastDraw) {
        if (each === 0 || useStagger === false) {
            // No stagger, run immediatly
            handleFrame.add(() => {
                callbackOnStop.forEach(({ cb }) => cb(cbObject));
            });
        } else {
            // Stagger
            callbackOnStop.forEach(({ cb, frame }) => {
                handleFrameIndex.add(() => cb(cbObject), frame + 1);
            });
        }
    }
};
