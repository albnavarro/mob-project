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
        handleFrame.add(({ shouldRender }) => {
            if (shouldRender) {
                callback.forEach(({ cb }) => {
                    cb(cbObject);
                });
            }
        });

        handleFrame.add(({ shouldRender }) => {
            callbackCache.forEach(({ cb }) => {
                if (shouldRender) {
                    handleCache.fireObject({ id: cb, obj: cbObject });
                }
            });
        });
    } else {
        // Stagger
        callback.forEach(({ cb, frame }) => {
            handleFrameIndex.add(({ shouldRender }) => {
                if (shouldRender) {
                    cb(cbObject);
                }
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
                cb(cbObject);

                if (stagger.waitComplete) {
                    if (i === slowlestStagger.index) {
                        onComplete();
                    }
                } else {
                    if (i === fastestStagger.index) {
                        onComplete();
                    }
                }
            }, frame + 1);
        });

        callbackCache.forEach(({ cb, frame }, i) => {
            handleFrameIndex.add(() => {
                handleCache.fireObject({ id: cb, obj: cbObject });

                if (stagger.waitComplete) {
                    if (i === slowlestStagger.index) {
                        onComplete();
                    }
                } else {
                    if (i === fastestStagger.index) {
                        onComplete();
                    }
                }
            }, frame + 1);
        });

        callbackOnComplete.forEach(({ cb, frame }) => {
            handleFrameIndex.add(() => {
                cb(cbObject);
            }, frame + 2);
        });
    }
};
