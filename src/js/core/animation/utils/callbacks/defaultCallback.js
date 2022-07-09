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
        handleFrame.add(() => {
            const lostFrameCounter = handleFrame.getDropFrameCounter();

            // No stagger, run immediatly
            if (lostFrameCounter === 2 || lostFrameCounter === -1) {
                callback.forEach(({ cb }) => {
                    cb(cbObject);
                });
            }
        });
    } else {
        // Stagger
        callback.forEach(({ cb, index, frame }, i) => {
            handleFrame.addIndex(() => {
                const lostFrameCounter = handleFrame.getDropFrameCounter();

                if (lostFrameCounter === 2 || lostFrameCounter === -1) {
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
