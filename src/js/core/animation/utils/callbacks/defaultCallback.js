import {
    handleFrame,
    handleNextFrame,
} from '../../../events/rafutils/rafUtils.js';

/**
Callback while Running
 **/
export const defaultCallback = ({
    stagger,
    callback,
    cbObject,
    useStagger,
}) => {
    if (stagger.each === 0 || !useStagger) {
        handleFrame.add((time, fps, dropFrameCounter) => {
            // No stagger, run immediatly
            if (dropFrameCounter === 2 || dropFrameCounter === -1) {
                callback.forEach(({ cb }) => {
                    cb(cbObject);
                });
            }
        });
    } else {
        // Stagger
        callback.forEach(({ cb, index, frame }, i) => {
            handleFrame.addIndex((time, fps, dropFrameCounter) => {
                if (dropFrameCounter === 2 || dropFrameCounter === -1) {
                    cb(cbObject);
                }
            }, frame);
        });
    }
};

/**
Callback on complete
 **/
export const defaultCallbackOnComplete = ({
    onComplete,
    callback,
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

            callbackOnComplete.forEach(({ cb }) => {
                cb(cbObject);
            });
        });
    } else {
        callback.forEach(({ cb, index, frame }, i) => {
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

        callbackOnComplete.forEach(({ cb, index, frame }, i) => {
            handleFrame.addIndex(() => {
                cb(cbObject);
            }, frame + 1);
        });
    }
};
