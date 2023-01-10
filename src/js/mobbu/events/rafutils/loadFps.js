import { frameStore } from './frameStore.js';

let loadFpsIsReady = false;

/**
 * @typedef {object} loadFpsType
 * @prop {number} averageFPS
    Detected fps value
 */

/**
 * @description
Runs a request animation frame loop to detect the frame rate of the monitor.
After the method will be resolved the first time, subsequent calls will be resolved immediately returning the previously calculated value.
The method is launched the first time automatically at the first loading.
 *
 * @param {number} [ duration = 30 ] - loop duration in frame, the default value is 30.
 * @return {Promise.<loadFpsType>} The promise launched after the loop
 *
 * @example
 * ```js
 *
 * loadFps(60).then(({ averageFPS }) => {
 *     // code
 * });
 *
 * ```
 */
export const loadFps = (duration = 30) => {
    if (loadFpsIsReady) {
        const { instantFps } = frameStore.get();
        return new Promise((resolve) => {
            resolve({ averageFPS: instantFps });
        });
    }

    return new Promise((resolve) => {
        const frameTimes = [];
        const maxFrames = 20;
        let frameCursor = 0;
        let numFrames = 0;
        let totalFPS = 0;
        let then = 0;
        let frameCounter = 0;

        const render = (now) => {
            now *= 0.001; // convert to seconds
            const deltaTime = now - then; // compute time since last frame
            then = now; // remember time for next frame
            const fps = 1 / deltaTime; // compute frames per second

            // add the current fps and remove the oldest fps
            totalFPS += fps - (frameTimes[frameCursor] || 0);

            // record the newest fps
            frameTimes[frameCursor++] = fps;

            // needed so the first N frames, before we have maxFrames, is correct.
            numFrames = Math.max(numFrames, frameCursor);

            // wrap the cursor
            frameCursor %= maxFrames;

            const averageFPS = parseInt(totalFPS / numFrames);

            frameCounter++;

            if (frameCounter >= duration) {
                frameStore.quickSetProp('instantFps', averageFPS);
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
