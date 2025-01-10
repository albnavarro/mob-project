// @ts-check

import { eventStore } from '../eventStore.js';

/**
 * @type {Map<number, import('./type.js').handleFrameCallbakType[]>}
 */
const indexCallbackMap = new Map();

/**
 * @param {number} currentFrameLimit
 *
 * @description
 * Update each callback's frame when handleFrame resets its index to avoid too large numbers>
 */
const updateKeys = (currentFrameLimit) => {
    const oldMapToArray = [...indexCallbackMap.entries()];
    indexCallbackMap.clear();

    oldMapToArray.forEach(([index, value]) => {
        indexCallbackMap.set(index - currentFrameLimit, value);
    });
};

/**
 * @param {Object} obj
 * @param {number} obj.currentFrame
 * @param {number} obj.time
 * @param {number} obj.fps
 * @return void
 *
 * @description
 * Fire callback
 *
 * @examples
 *
 * ```javascript
 * handleFrameIndex.fire(({ currentFrame, fps,  time });      *
 * ```
 */
const fire = ({ currentFrame, time, fps }) => {
    /**
     * Get arrays of callBack related to the current currentFrame
     * indexCb is a 'global' variables instead constant to reduce garbage collector
     */
    const callabacks = indexCallbackMap.get(currentFrame) ?? [];
    if (!callabacks || callabacks.length === 0) return;

    callabacks.forEach((item) => item({ time, fps }));
    indexCallbackMap.delete(currentFrame);
};

/**
 * @description
 * Add callback to a specific frame.
 *
 * @memberof module:handleFrameIndex
 * @param {import('./type.js').handleFrameCallbakType} callback - callback function
 * @param {number} index
 *
 * @example
 * ```javascript
 * handleFrameIndex.add(({ fps,  time }) => {
 *     // code ...
 * }, 5);
 *
 * ```
 */
const add = (callback, index) => {
    /**
     * @type {number}
     */
    const frameIndex = index + eventStore.getProp('currentFrame');

    /**
     *  Add callback to array related to specific index idf exxist or create
     *  in a bigger set of callaback
     */
    const callabacks = indexCallbackMap.get(frameIndex) ?? [];
    indexCallbackMap.set(frameIndex, [...callabacks, callback]);
    eventStore.emit('requestFrame');
};

/**
 * @description
 * Get callback array length
 *
 * @returns {number}
 */
const getAmountOfFrameToFire = () => {
    return indexCallbackMap.size;
};

/**
 *
 * @description
 * Execute a callback at a specific frame.
 */
export const handleFrameIndex = (() => {
    return {
        add,
        fire,
        updateKeys,
        getAmountOfFrameToFire,
    };
})();
