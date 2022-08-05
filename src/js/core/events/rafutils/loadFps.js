import { frameStore } from './frameStore.js';

/**
 * https://itecnote.com/tecnote/javascript-recording-fps-in-webgl/
 *  Intial loop fo reach the right fps
 *  loadFps().then(() => ... );
 *  To get the right FPS immediatly use a different calcultation respect handleFrame
 *  More Havier but run in a very limited time
 */
let loadFpsIsReady = false;

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
                frameStore.set('instantFps', averageFPS);
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

/**
 * Utils to centralize all action form all components in one Request Animation Frame,
 * All subsciber use the same frame
 * handleFrame run once then delete all subscriber
 * Use inside a loop or inside eventListener like scroll or mousemove
 *
 * @example:
 *
 * handleFrame.add(() => {
 *     myFunction()
 * });
 *
 */

/**
 *  Load fos to set initial stabel fps
 */
loadFps();
