import { eventStore } from '../event-store.js';

/**
 * @type {Map<number, import('./type.js').HandleFrameCallbak[]>}
 */
const indexCallbackMap = new Map();

/**
 * Update each callback's frame when handleFrame resets its index to avoid too large numbers>
 *
 * @param {number} currentFrameLimit
 */
const updateKeys = (currentFrameLimit) => {
    const oldMapToArray = [...indexCallbackMap.entries()];
    indexCallbackMap.clear();

    oldMapToArray.forEach(([index, value]) => {
        indexCallbackMap.set(index - currentFrameLimit, value);
    });
};

/**
 * Fire callback
 *
 * @example
 *     ```javascript
 *     handleFrameIndex.fire(({ currentFrame, fps,  time });      *
 *     ```;
 *
 * @param {Object} obj
 * @param {number} obj.currentFrame
 * @param {number} obj.time
 * @param {number} obj.fps
 * @returns {void}
 */
const fire = ({ currentFrame, time, fps }) => {
    /**
     * Get arrays of callBack related to the current currentFrame indexCb is a 'global' variables instead constant to
     * reduce garbage collector
     */
    const callabacks = indexCallbackMap.get(currentFrame) ?? [];
    if (!callabacks || callabacks.length === 0) return;

    callabacks.forEach((item) => item({ time, fps }));
    indexCallbackMap.delete(currentFrame);
};

/**
 * Add callback to a specific frame.
 *
 * @memberof module:handleFrameIndex
 * @example
 *     ```javascript
 *     handleFrameIndex.add(({ fps,  time }) => {
 *         // code ...
 *     }, 5);
 *
 *     ```;
 *
 * @param {import('./type.js').HandleFrameCallbak} callback - Callback function
 * @param {number} index
 */
const add = (callback, index) => {
    /**
     * @type {number}
     */
    const frameIndex = index + eventStore.getProp('currentFrame');

    /**
     * Add callback to array related to specific index idf exxist or create in a bigger set of callaback
     */
    const callabacks = indexCallbackMap.get(frameIndex) ?? [];
    indexCallbackMap.set(frameIndex, [...callabacks, callback]);
    eventStore.emit('requestFrame');
};

/**
 * Get callback array length
 *
 * @returns {number}
 */
const getAmountOfFrameToFire = () => {
    return indexCallbackMap.size;
};

/**
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
