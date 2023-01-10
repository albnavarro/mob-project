import { frameStore } from './frameStore.js';

/**
 * @description
 * Execute a callback at a specific frame.
 */
export const handleFrameIndex = (() => {
    let indexCallback = {};
    let indexCallbackLength = 0;
    let indexCb = null;

    /**
     * @description
     * Update each callback's frame when handleFrame resets its index to avoid too large numbers>
     */
    const updateKeys = (currentFrameLimit) => {
        Object.keys(indexCallback).forEach((key) => {
            delete Object.assign(indexCallback, {
                [`${parseInt(key) - currentFrameLimit}`]: indexCallback[key],
            })[key];
        });
    };

    /**
     * @description
     * Fire callback
     *
     * @param {import('./handleFrame.js').handleFrameTypes)}
     *
     * @example
     * ```js
     * handleFrameIndex.add(({ fps, shouldRender, time });      *
     * ```
     */
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

    /**
     * @description
     * Add callback to a specific frame.
     *
     * @param {function(import('./handleFrame.js').handleFrameTypes):void } cb - callback function
     * @pram {number} index
     *
     * @example
     * ```js
     * handleFrameIndex.add(({ fps, shouldRender, time }) => {
     *     // code ...
     * }, 5);
     *
     * ```
     */
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

    /**
     * @description
     * Get callabck array length
     *
     * @returns {number}
     */
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
