import { frameStore } from './frameStore.js';

export const handleFrameIndex = (() => {
    let indexCallback = {};
    let indexCallbackLength = 0;
    let indexCb = null;

    const updateKeys = (currentFrameLimit) => {
        Object.keys(indexCallback).forEach((key) => {
            delete Object.assign(indexCallback, {
                [`${parseInt(key) - currentFrameLimit}`]: indexCallback[key],
            })[key];
        });
    };

    const fire = ({ currentFrame, time, fps, shouldRender }) => {
        /*
        Get arrays of callBack related to the current currentFrame
        indexCb is a 'global' variables instead constant to reduce garbage collector
        */
        indexCb = indexCallback[currentFrame];
        if (indexCb) {
            indexCb.forEach((item) => item({ time, fps, shouldRender }));
            /*
            Remove cb array once fired
            */
            indexCallback[currentFrame] = null;
            delete indexCallback[currentFrame];
            indexCallbackLength = indexCallbackLength - 1;
        } else {
            indexCb = null;
        }
    };

    const add = (cb, index) => {
        const frameIndex = index + frameStore.getProp('currentFrame');

        /**
         *  Add callback to array related to specific index idf exxist or create
         *  use frameIndex for key of Object so i can get the sb array in in the fastest way possible
         *  in a bigger set of callaback
         */
        if (indexCallback[frameIndex]) {
            indexCallback[frameIndex].push(cb);
        } else {
            indexCallback[frameIndex] = [cb];
            indexCallbackLength++;
        }

        frameStore.emit('requestFrame');
    };

    const getIndexCallbackLenght = () => {
        return indexCallbackLength;
    };

    return {
        add,
        fire,
        updateKeys,
        getIndexCallbackLenght,
    };
})();
