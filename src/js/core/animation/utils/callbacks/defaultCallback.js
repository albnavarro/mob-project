import {
    handleFrame,
    handleNextFrame,
    handleFrameIndex,
} from '../../../events/rafutils/rafUtils.js';

/**
Get delta fps compared to the maximum fps detected
 **/
export const getDeltaFps = ({ inMotion, isRealFps, maxFps, fps }) => {
    return !inMotion || !isRealFps ? 0 : Math.abs(maxFps - fps);
};

/**
Callback while Running
 **/
export const defaultCallback = ({
    stagger,
    callback,
    deltaFps,
    fpsThreshold,
    maxFps,
    fps,
    cbObject,
    useStagger,
}) => {
    handleFrame.add(() => {
        if (stagger.each === 0 || !useStagger) {
            // No stagger, run immediatly
            callback.forEach(({ cb }) => {
                if (deltaFps < fpsThreshold || fps > maxFps) cb(cbObject);
            });
        } else {
            // Stagger
            callback.forEach(({ cb, index, frame }, i) => {
                handleFrameIndex(() => {
                    if (deltaFps < fpsThreshold || fps > maxFps) cb(cbObject);
                }, frame);
            });
        }
    });
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
            handleFrameIndex(() => {
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
            handleFrameIndex(() => {
                cb(cbObject);
            }, frame + 1);
        });
    }
};
