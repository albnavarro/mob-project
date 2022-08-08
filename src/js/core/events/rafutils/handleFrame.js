import { getTime, defaultTimestep } from '../../utils/time.js';
import { handleSetUp } from '../../setup.js';
import { handleVisibilityChange } from '../visibilityChange/handleVisibilityChange.js';
import { handleCache } from './handleCache.js';
import { handleNextTick } from './handleNextTick.js';
import { handleNextFrame } from './handleNextFrame.js';
import { handleFrameIndex } from './handleFrameIndex';
import { frameStore } from './frameStore.js';

export const handleFrame = (() => {
    /*
    10000 is maximum stagger frame delay
    */
    const currentFrameLimit = 10000000;
    const firstRunDuration = 2000;

    let frameIsRuning = false;
    let callback = [];
    let time = getTime();
    let prevTime = time;
    let startTime = 0;
    let rawTime = 0;
    let timeElapsed = 0;
    let isStopped = false;
    // Stable fps
    let fps = handleSetUp.get('startFps');
    let maxFps = fps;
    let frames = 0;
    let fpsPrevTime = 0;
    // fpsScale fps
    let dropFps = fps;
    let currentFrame = 0;

    /**
     * Check if frame drop by fpsScalePercent value
     * when value is -1 || 2 animation ( or whoever use it ) is rendered
     * */
    let dropFrameCounter = -1;
    let shouldRender = true;
    let fpsScalePercent = handleSetUp.get('fpsScalePercent');
    let useScaleFpsf = handleSetUp.get('useScaleFps');

    // Stop timer when user change tab
    handleVisibilityChange(({ visibilityState }) => {
        isStopped = visibilityState === 'visible';
    });

    // Call new requestAnimationFrame on event emit
    frameStore.watch('requestFrame', () => {
        initFrame();
    });
    /*
     * Check if animation is renderable in current frame
     *
     **/
    const getRenderStatus = () => {
        if (!useScaleFpsf) return true;

        const activeModule = Object.entries(fpsScalePercent).reduce(
            (acc, [fpsValue, fpsModule]) => {
                const delta = Math.abs(maxFps - dropFps);

                /**
                 * Get delta value in percent
                 * Assuming that fpsValue in in percent
                 * Compare and check if we are under fpsValue
                 **/
                const deltaPercent = Math.round((delta * 100) / maxFps);
                const isOutOfRange = deltaPercent > parseInt(fpsValue);
                return isOutOfRange ? fpsModule : acc;
            },
            1
        );
        dropFrameCounter = (dropFrameCounter + 1) % activeModule;
        return dropFrameCounter === 0;
    };

    /*
     * Next tick function
     **/
    const nextTickFn = () => {
        /*
         * If currentFrame reach currentFrameLimit back to zero to avoid big numbers
         * executte the opration outside requestAnimationFrame if deferredNextTick is active
         */
        if (currentFrame === currentFrameLimit) {
            currentFrame = 0;
            frameStore.set('currentFrame', currentFrame);
            handleFrameIndex.updateKeys(currentFrameLimit);
            handleCache.updateFrameId(currentFrameLimit);
        }

        /*
        RequestAnimationFrame is ended, ready for another
        */
        frameIsRuning = false;

        /*
        Fire next tick
        */
        handleNextTick.fire({ time, fps, shouldRender });

        /*
        Get next callback
        */
        callback = [...callback, ...handleNextFrame.get()];
        /*
        Next frame condition
        */
        if (
            callback.length > 0 ||
            handleFrameIndex.getIndexCallbackLenght() > 0 ||
            handleCache.getCacheCounter() > 0 ||
            time < firstRunDuration
        ) {
            // Call Next animationFrame
            initFrame();
        } else {
            isStopped = true;
            currentFrame = 0;
            frameStore.set('currentFrame', currentFrame);
        }
    };

    const render = (timestamp) => {
        /**
         * Update time
         **/
        time = timestamp;
        timeElapsed = time - rawTime;

        if (isStopped) startTime += timeElapsed;

        rawTime += timeElapsed;
        time = rawTime - startTime;

        /*
         * Get fps per frame, this value is not very precise
         * but is usefull to detect instantly a loss
         * of performane
         **/
        dropFps = parseInt(1000 / (time - prevTime));
        dropFps =
            dropFps < maxFps && time > firstRunDuration ? dropFps : maxFps;
        prevTime = time;

        /**
         * Get fps
         * Update fps every second
         **/
        if (!isStopped) frames++;

        if (time > fpsPrevTime + 1000) {
            /**
             * Calc fps
             * Set fps when stable after 2 seconds otherwise use instantFps
             **/
            fps =
                time > firstRunDuration
                    ? Math.round((frames * 1000) / (time - fpsPrevTime))
                    : frameStore.getProp('instantFps');
            fpsPrevTime = time;
            frames = 0;

            /**
             * Update value every seconds
             **/
            fpsScalePercent = handleSetUp.get('fpsScalePercent');
            useScaleFpsf = handleSetUp.get('useScaleFps');
        }

        /**
         * Update max fps
         * */
        if (fps > maxFps) maxFps = fps;

        /**
         * Chek if current frame can fire animation
         * */
        shouldRender = getRenderStatus();

        /*
        Fire callbnack
        */
        callback.forEach((item) => item({ time, fps, shouldRender }));

        /*
        Fire callback related to specific index frame
        */
        handleFrameIndex.fire({ currentFrame, time, fps, shouldRender });

        /*
        Fire handleCache callBack
        */
        handleCache.fire(currentFrame, shouldRender);

        /*
        Update currentFrame
        */
        currentFrame++;
        frameStore.set('currentFrame', currentFrame);

        /*
        Reset props
        */
        callback.length = 0;
        isStopped = false;

        const deferredNextTick = handleSetUp.get('deferredNextTick');

        if (deferredNextTick) {
            setTimeout(() => nextTickFn());
        } else {
            nextTickFn();
        }
    };

    /**
     * Init new frame if is not running
     */
    const initFrame = () => {
        if (frameIsRuning) return;

        if (typeof window !== 'undefined') {
            requestAnimationFrame(render);
        } else {
            setTimeout(() => render(getTime()), defaultTimestep);
        }

        frameIsRuning = true;
    };

    const getFps = () => fps;

    /**
     *  Add callback
     */
    const add = (cb) => {
        callback.push(cb);
        initFrame();
    };

    /**
     *  Add multiple callback
     */
    const addMultiple = (arr) => {
        callback = [...callback, ...arr];
        initFrame();
    };

    return {
        add,
        addMultiple,
        getFps,
    };
})();
