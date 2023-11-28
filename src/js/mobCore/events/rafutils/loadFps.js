// @ts-check

import { eventStore } from '../eventStore';

/**
 * @type {Boolean}
 */
let loadFpsIsReady = false;

/**
 * @description -  Runs a request animation frame loop to detect the frame rate of the monitor.
 *   After the method will be resolved the first time, subsequent calls will be resolved immediately returning the previously calculated value.
 *   The method is launched the first time automatically at the first loading.
 *
 * @param {number} [ duration = 30 ] - loop duration in frame, the default value is 30.
 * @return {Promise.<import('./type').loadFpsTypes>} The promise launched after the loop
 *
 * @example
 * ```javascript
 *
 * loadFps(60).then(({ averageFPS }) => {
 *     // code
 * });
 *
 * ```
 */
export const loadFps = (duration = 30) => {
    if (loadFpsIsReady) {
        const { instantFps } = eventStore.get();
        return new Promise((resolve) => {
            resolve({ averageFPS: instantFps });
        });
    }

    return new Promise((resolve) => {
        /**
         * @type {Array.<Number>}
         */
        const frameTimes = [];

        /**
         * @type {Number}
         */
        const maxFrames = 20;

        /**
         * @type {Number}
         */
        let frameCursor = 0;

        /**
         * @type {Number}
         */
        let numFrames = 0;

        /**
         * @type {Number}
         */
        let totalFPS = 0;

        /**
         * @type {Number}
         */
        let then = 0;

        /**
         * @type {Number}
         */
        let frameCounter = 0;

        /**
         * @param {Number} now
         */
        const render = (now) => {
            // convert to seconds
            now *= 0.001;

            // compute time since last frame
            const deltaTime = now - then;

            // remember time for next frame
            then = now;

            // compute frames per second
            const fps = 1 / deltaTime;

            // add the current fps and remove the oldest fps
            totalFPS += fps - (frameTimes[frameCursor] || 0);

            // record the newest fps
            frameTimes[frameCursor++] = fps;

            // needed so the first N frames, before we have maxFrames, is correct.
            numFrames = Math.max(numFrames, frameCursor);

            // wrap the cursor
            frameCursor %= maxFrames;

            const averageFPS = Math.round(totalFPS / numFrames);

            frameCounter++;

            if (frameCounter >= duration) {
                eventStore.quickSetProp('instantFps', averageFPS);
                loadFpsIsReady = true;
                resolve({
                    averageFPS: averageFPS,
                });
                return;
            }

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    });
};
