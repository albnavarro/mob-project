import { handleFrame } from '../../../events/rafutils/handleFrame.js';
import { handleNextFrame } from '../../../events/rafutils/handleNextFrame.js';
import { handleCache } from '../../../events/rafutils/handleCache.js';

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
            handleFrame.addIndex(({ shouldRender }) => {
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
            handleFrame.addIndex(() => {
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
            }, frame);
        });

        callbackCache.forEach(({ cb, frame }, i) => {
            handleFrame.addIndex(() => {
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
            }, frame);
        });

        callbackOnComplete.forEach(({ cb, frame }) => {
            handleFrame.addIndex(() => {
                cb(cbObject);
            }, frame + 1);
        });
    }
};
