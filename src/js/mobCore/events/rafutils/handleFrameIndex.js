// @ts-check

import { eventStore } from '../eventStore.js';

/**
 * @type {Object}
 */
const indexCallbackObject = {};

/**
 * @type {Number}
 */
let amountOfFrameToFire = 0;

/**
 * @param {Number} currentFrameLimit
 *
 * @description
 * Update each callback's frame when handleFrame resets its index to avoid too large numbers>
 */
const updateKeys = (currentFrameLimit) => {
    Object.keys(indexCallbackObject).forEach((key) => {
        delete Object.assign(indexCallbackObject, {
            [`${Number.parseInt(key) - currentFrameLimit}`]:
                indexCallbackObject[key],
        })[key];
    });
};

/**
 * @param { Object } obj
 * @param {Number} obj.currentFrame
 * @param {Number} obj.time
 * @param {Number} obj.fps
 * @param {Boolean} obj.shouldRender
 * @return void
 *
 * @description
 * Fire callback
 *
 * @examples
 *
 * ```javascript
 * handleFrameIndex.fire(({ currentFrame, fps, shouldRender, time });      *
 * ```
 */
const fire = ({ currentFrame, time, fps, shouldRender }) => {
    /**
     * @type {Array.<Function>}
     *
     * @description
     * Get arrays of callBack related to the current currentFrame
     * indexCb is a 'global' variables instead constant to reduce garbage collector
     */
    const indexCallbackArray = indexCallbackObject[currentFrame];
    if (!indexCallbackArray) return;

    indexCallbackArray.forEach((item) => item({ time, fps, shouldRender }));

    /**
     * Remove cb array once fired
     */
    indexCallbackObject[currentFrame] = null;
    delete indexCallbackObject[currentFrame];
    amountOfFrameToFire = amountOfFrameToFire - 1;
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
 * handleFrameIndex.add(({ fps, shouldRender, time }) => {
 *     // code ...
 * }, 5);
 *
 * ```
 */
const add = (callback, index) => {
    /**
     * @type {Number}
     */
    const frameIndex = index + eventStore.getProp('currentFrame');

    /**
     *  Add callback to array related to specific index idf exxist or create
     *  use frameIndex for key of Object so i can get the sb array in in the fastest way possible
     *  in a bigger set of callaback
     */
    if (indexCallbackObject[frameIndex]) {
        indexCallbackObject[frameIndex].push(callback);
    } else {
        indexCallbackObject[frameIndex] = [callback];
        amountOfFrameToFire++;
    }

    eventStore.emit('requestFrame');
};

/**
 * @description
 * Get callback array length
 *
 * @returns {number}
 */
const getAmountOfFrameToFire = () => {
    return amountOfFrameToFire;
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
