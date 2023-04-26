import { handleFrame } from '../../../events/rafutils/handleFrame.js';
import { handleNextFrame } from '../../../events/rafutils/handleNextFrame.js';
import { handleCache } from '../../../events/rafutils/handleCache.js';
import { handleFrameIndex } from '../../../events/rafutils/handleFrameIndex.js';

/**
Callback while Running
 **/
export const defaultCallback = ({
    stagger,
    callback,
    callbackCache,
    cbObject,
    useStagger,
}) => {
    if (stagger.each === 0 || !useStagger) {
        handleFrame.add(() => {
            callback.forEach(({ cb }) => {
                cb(cbObject);
            });
        });

        handleFrame.add(() => {
            callbackCache.forEach(({ cb }) => {
                handleCache.fireObject({ id: cb, obj: cbObject });
            });
        });
    } else {
        // Stagger
        callback.forEach(({ cb, frame }) => {
            handleFrameIndex.add(() => {
                cb(cbObject);
            }, frame);
        });

        callbackCache.forEach(({ cb, frame }) => {
            handleCache.update({ id: cb, cbObject, frame });
        });
    }
};

/**
Callback on complete
 **/
export const defaultCallbackOnComplete = ({
    onComplete,
    callback,
    callbackCache,
    callbackOnComplete,
    cbObject,
    stagger,
    slowlestStagger,
    fastestStagger,
    useStagger,
}) => {
    if (stagger.each === 0 || !useStagger) {
        onComplete();

        handleNextFrame.add(() => {
            // Fire callback with exact end value
            callback.forEach(({ cb }) => {
                cb(cbObject);
            });

            callbackCache.forEach(({ cb }) => {
                handleCache.fireObject({ id: cb, obj: cbObject });
            });

            callbackOnComplete.forEach(({ cb }) => {
                cb(cbObject);
            });
        });
    } else {
        callback.forEach(({ cb, frame }, i) => {
            handleFrameIndex.add(() => {
                if (stagger.waitComplete) {
                    if (i === slowlestStagger.index) {
                        cb(cbObject);
                        onComplete();
                    }
                } else {
                    if (i === fastestStagger.index) {
                        cb(cbObject);
                        onComplete();
                    }
                }
            }, frame);
        });

        callbackCache.forEach(({ cb, frame }, i) => {
            handleFrameIndex.add(() => {
                if (stagger.waitComplete) {
                    if (i === slowlestStagger.index) {
                        handleCache.fireObject({ id: cb, obj: cbObject });
                        onComplete();
                    }
                } else {
                    if (i === fastestStagger.index) {
                        handleCache.fireObject({ id: cb, obj: cbObject });
                        onComplete();
                    }
                }
            }, frame);
        });

        callbackOnComplete.forEach(({ cb, frame }) => {
            handleFrameIndex.add(() => {
                cb(cbObject);
            }, frame + 1);
        });
    }
};
