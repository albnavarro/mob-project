// @ts-check

import { eventStore } from '../eventStore';

/**
 * @type {boolean}
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
         * @type {Array.<number>}
         */
        const frameTimes = [];

        /**
         * @type {number}
         */
        const maxFrames = 25;

        /**
         * @type {number}
         */
        let frameCursor = 0;

        /**
         * @type {number}
         */
        let numFrames = 0;

        /**
         * @type {number}
         */
        let totalFPS = 0;

        /**
         * @type {number}
         */
        let then = 0;

        /**
         * @type {number}
         */
        let frameCounter = 0;

        /**
         * @param {number} now
         */
        const render = (now) => {
            // convert to seconds
            now *= 0.001;

            // compute time since last frame
            const deltaTime = now - then;

            // remember time for next frame
            then = now;

            // compute frames per second, prevent inifinit || NaN.
            const rawFps = Number.isFinite(1 / deltaTime) ? 1 / deltaTime : 60;

            // Doasn/t consider fps < 60.
            const fps = Math.max(rawFps, 60);

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
                resolve({ averageFPS });
                return;
            }

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    });
};
