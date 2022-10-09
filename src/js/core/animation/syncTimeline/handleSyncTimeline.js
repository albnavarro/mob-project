import { loadFps } from '../../events/rafutils/loadFps.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextFrame } from '../../events/rafutils/handleNextFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { clamp } from '../utils/animationUtils.js';
import { handleSetUp } from '../../setup.js';
import { fpsLoadedLog } from '../utils/log.js';
import { storeType } from '../../store/storeType.js';
import { directionConstant } from '../utils/constant.js';
import { syncTimelineLabelWarning } from '../utils/warning.js';

/**
 * @typedef {Object} syncTimelineTypes
 * @prop {Number} duration duration in millisecond of timeline,
 * @prop {Boolean} [yoyo=0] Reverse the direction each time the animation ends
 * @prop {Number} [repeat=0] how many times the animation should be repeated, -1 means that the animation will run in an infinite loop
 */
export class HandleSyncTimeline {
    /**
     * @param { syncTimelineTypes } data
     *
     * @example
     * ```js
     * const myTimeline = new HandleSyncTimeline({
     *   duration: [ Number ],
     *   yoyo: [ Boolean ],
     *   repeat: [ Number ]
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myTimeline.add()
     * myTimeline.onLoopEnd()
     * myTimeline.onComplete()
     * myTimeline.onUpdate()
     * myTimeline.stop()
     * myTimeline.play()
     * myTimeline.playReverse()
     * myTimeline.playFrom()
     * myTimeline.playFromReverse()
     * myTimeline.reverse()
     * myTimeline.pause()
     * myTimeline.resume()
     * myTimeline.isActive()
     * myTimeline.isPaused()
     * myTimeline.getDirection()
     * myTimeline.getTime()
     * myTimeline.destroy()
     * ```
     */
    constructor(data = {}) {
        this.duration = data?.duration || handleSetUp.get('sequencer').duration;
        this.yoyo = data?.yoyo || false;
        this.repeat = data?.repeat || 0;

        /**
         * Child
         */
        this.sequencers = [];

        /**
         * Time prop
         */
        this.startTime = null;
        this.timeElapsed = 0;
        this.currentTime = 0;
        this.pauseTime = 0;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;

        /*
         * Reverse prop
         */
        this.isReverse = false;
        this.startReverse = false;
        this.isPlayngReverse = false;

        /**
         * Loop prop
         */
        this.loopCounter = 0;
        this.loopIteration = 0;
        this.minLoopIteration = 10;

        /*
         * Generic prop
         */
        this.sequencers = [];
        this.isStopped = true;
        this.skipFirstRender = false;
        this.completed = false;
        this.fpsIsInLoading = false;
        this.isInPause = false;

        // callbackLoop on complete
        this.callbackId = 0;
        this.callbackLoop = [];
        this.callbackComplete = [];
        this.callbackOnUpdate = [];
    }

    updateTime(time, fps, shouldRender) {
        if (this.isStopped || this.fpsIsInLoading) return;

        // If loop anitcipate by half frame ( in millsenconds ) next loop so we a have more precise animation
        const frameThreshold =
            !this.repeat ||
            (this.repeat >= 2 && this.loopCounter === this.repeat - 1)
                ? 0
                : 1000 / fps / 2;

        if (this.isInPause) {
            this.pauseTime =
                time -
                this.startTime -
                this.timeElapsed -
                this.timeAtReverseBack;
        }

        this.timeElapsed = parseInt(
            time - this.startTime - this.pauseTime - this.timeAtReverseBack
        );

        const partial = !this.isReverse
            ? this.timeElapsed
            : this.timeAtReverse - (this.timeElapsed - this.timeAtReverse);

        if (!this.isInPause) {
            this.currentTime = clamp(partial, 0, this.duration);

            // When come from playReverse skip first frame becouse is 0
            if (!this.skipFirstRender) {
                if (shouldRender) {
                    this.sequencers.forEach((item) => {
                        item.draw({
                            partial: this.currentTime,
                            isLastDraw: false,
                            useFrame: true,
                            direction: this.getDirection(),
                        });
                    });
                }

                /*
                 * Fire callbackOnUpdate
                 */
                this.callbackOnUpdate.forEach(({ cb }) => {
                    cb({
                        time: this.currentTime,
                        direction: this.getDirection(),
                    });
                });
            }
        }

        this.skipFirstRender = false;
        this.loopIteration++;

        /**
         * Loop control
         * Check if end of time has been achieved
         * */
        if (
            partial <= this.duration - frameThreshold &&
            partial >= 0 + frameThreshold &&
            !this.isStopped
        ) {
            this.completed = false;
            this.goToNextFrame();
            return;
        }

        // Reset sequancer callback add function state
        this.resetSequencerLastValue();

        /*
         * Start revere animation
         * In start reverse the first framme jump directly here
         **/
        if (this.startReverse) {
            this.isReverse = true;
            this.timeAtReverse = 0;
            this.timeAtReverseBack = 0;
            this.startReverse = false;
            this.goToNextFrame();
            return;
        }

        /*
         * Store direction value before chengee during nextFrame
         **/
        const direction = this.getDirection();
        handleNextFrame.add(() => {
            /*
             *
             * Prevent multiple fire of complete event
             * Send direction BACKWARD || FORWARD as argument
             * If loop is too fast consider end of loop invalid
             * Prevent error from cycle that start fromm end
             * in reverse mode
             **/
            if (
                !this.fpsIsInLoading &&
                !this.completed &&
                this.loopIteration > this.minLoopIteration
            ) {
                this.completed = true;
                this.loopCounter++;
                // this callback is fired after a frame so
                // check end timeline use the right value not resetted
                this.loopIteration = 0;

                this.callbackLoop.forEach(({ cb }) =>
                    cb({
                        direction,
                        loop: this.loopCounter,
                    })
                );
            }
        });

        /**
         * Timelinee is ended, no repeat or loop max iteration is reached
         **/
        if (
            !this.repeat ||
            (this.loopCounter === this.repeat - 1 &&
                this.loopIteration > this.minLoopIteration)
        ) {
            // Fire callbackLoop onStop of each sequencr
            // Prevent async problem, endTime back to start, so store the value
            const endTime = this.currentTime;
            this.sequencers.forEach((item) => {
                item.draw({
                    partial: endTime,
                    isLastDraw: true,
                    useFrame: true,
                    direction: this.getDirection(),
                });
            });

            this.isStopped = true;
            this.resetTime();
            this.startTime = time;
            if (this.isReverse) this.isReverse = false;

            // Fire last callback on Complete
            this.callbackComplete.forEach(({ cb }) => cb());
            return;
        }

        /**
         * In yoyo mode time line have to reverst at the end of cycle
         **/
        if (this.yoyo) {
            this.reverse();
            this.goToNextFrame();
            return;
        }

        /**
         * Reverse playing
         **/
        if (this.isPlayngReverse) {
            this.resetTime();
            this.startTime = time;
            if (!this.isReverse) this.isPlayngReverse = !this.isPlayngReverse;
            this.timeElapsed = this.duration;
            this.currentTime = this.duration;
            this.pauseTime = this.duration;
            this.goToNextFrame();
            return;
        }

        /**
         * Default playing
         **/
        this.resetTime();
        this.startTime = time;
        if (this.isReverse) this.isPlayngReverse = !this.isPlayngReverse;
        this.goToNextFrame();
    }

    /**
     * @private
     */
    goToNextFrame() {
        handleFrame.add(() => {
            handleNextTick.add(({ time, fps, shouldRender }) => {
                // Prevent fire too many raf
                if (!this.fpsIsInLoading)
                    this.updateTime(time, fps, shouldRender);
            });
        });
    }

    /**
     * @private
     */
    resetTime() {
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
    }

    /**
     * @private
     */
    getTimeFromLabel(label) {
        const labelObj = this.sequencers.reduce((p, c) => {
            const currentLabels = c.getLabels();
            const labelsMatched = currentLabels.find(
                ({ name: currentName }) => currentName === label
            );

            return labelsMatched || p;
        }, null);

        if (!labelObj) syncTimelineLabelWarning(label);
        return labelObj?.time;
    }

    /**
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.play();
     *
     *
     * ```
     *
     * @description
     * Plays the timeline starting from the initial value
     */
    play() {
        if (this.fpsIsInLoading) return;

        this.playFromTime();
        return this;
    }

    /**
     * @param {Number|String} value
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.playFrom(1000);
     * myTimeline.playFrom('myLabel');
     *
     *
     * ```
     *
     * @description
     * Plays the timeline forward starting from the specific time or from a label defined in a Handle Sequencer | HandleMasterSequencer instance
     */
    playFrom(value = 0) {
        if (this.fpsIsInLoading) return;

        const isNumber = storeType.isNumber(value);
        const labelTime = isNumber ? value : this.getTimeFromLabel(value);
        this.playFromTime(labelTime);
        return this;
    }

    /**
     * @private
     */
    playFromTime(time = 0) {
        // Reset sequancer callback add function state
        this.resetSequencerLastValue();
        this.resetTime();

        /*
         * Set time
         */
        this.currentTime = time;
        this.timeAtReverseBack = -this.currentTime;

        /*
         * Generic prop
         */
        this.isPlayngReverse = false;

        /*
         * Prevent multile firing
         */
        this.fpsIsInLoading = true;
        this.startAnimation(time);
    }

    /**
     * @param {Number|String} value
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.playFromReverse(1000);
     * myTimeline.playFromReverse('myLabel');
     *
     *
     * ```
     *
     * @description
     * Plays the timeline backward starting from the specific time or from a label defined in a Handle Sequencer | HandleMasterSequencer instance
     */
    playFromReverse(value) {
        if (this.fpsIsInLoading) return;

        const isNumber = storeType.isNumber(value);
        const labelTime = isNumber ? value : this.getTimeFromLabel(value);
        this.playFromTimeReverse(labelTime, true);
        return this;
    }

    /**
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.playReverse();
     *
     *
     * ```
     *
     * @description
     * Plays the timeline starting from the end value
     */
    playReverse() {
        if (this.fpsIsInLoading) return;

        this.playFromTimeReverse(this.duration, true);
        return this;
    }

    /**
     * @private
     */
    playFromTimeReverse(time = 0) {
        // Reset sequancer callback add function state
        this.resetSequencerLastValue();

        /*
         * Set time
         */
        this.timeElapsed = time;
        this.currentTime = time;
        this.pauseTime = time;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;

        /*
         * Generic prop
         */
        this.startReverse = true;
        this.isPlayngReverse = true;
        this.skipFirstRender = true;

        /*
         * Prevent multile firing
         */
        this.fpsIsInLoading = true;
        this.startAnimation(time);
    }

    /**
     * Find label tha match the occurrency and return the time
     */
    startAnimation(partial) {
        if (this.repeat === 0) return;

        loadFps().then(({ averageFPS }) => {
            fpsLoadedLog('sequencer', averageFPS);
            this.isReverse = false;

            this.sequencers.forEach((item) => {
                item.inzializeStagger();
                item.disableStagger();
                item.draw({
                    partial,
                    isLastDraw: false,
                    useFrame: true,
                    direction: this.getDirection(),
                });
            });

            handleFrame.add(() => {
                handleNextTick.add(({ time, fps, shouldRender }) => {
                    this.startTime = time;
                    this.fpsIsInLoading = false;
                    this.isStopped = false;
                    this.isInPause = false;
                    this.loopCounter = 0;
                    this.updateTime(time, fps, shouldRender);
                });
            });
        });
    }

    /**
     *
     * @example
     * ```js
     * myTimeline.pause();
     *
     *
     * ```
     *
     * @description
     * Pause timeline
     */
    pause() {
        if (this.isStopped || this.isInPause || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.isInPause = true;
    }

    /**
     *
     * @example
     * ```js
     * myTimeline.resume();
     *
     *
     * ```
     *
     * @description
     * Resume timeline from pause
     */
    resume() {
        if (this.isStopped || !this.isInPause || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.isInPause = false;
    }

    /**
     *
     * @example
     * ```js
     * myTimeline.reverse();
     *
     *
     * ```
     *
     * @description
     * Reverse the direction while the timeline is running
     */
    reverse() {
        if (this.isStopped || this.isInPause || this.fpsIsInLoading) return;

        // Reset sequancer callback add function state
        this.resetSequencerLastValue();
        this.isReverse = !this.isReverse;
        if (this.isReverse) {
            this.timeAtReverse = this.timeElapsed;
        } else {
            this.timeAtReverseBack += this.timeElapsed - this.currentTime;
        }
    }

    /**
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.stop();
     *
     *
     * ```
     *
     * @description
     * Stop timeline
     */
    stop() {
        this.isStopped = true;
        this.isInPause = false;

        // TO DO: con lo stagger il render del last frame ( es senza translate3d)
        // va in conflitto con cleanCachedId

        // Fire callbackLoop onStop of each sequencr
        // this.sequencers.forEach((item) => {
        //     item.draw({
        //         partial: this.currentTime,
        //         isLastDraw: true,
        //         useFrame: true,
        //         direction: this.getDirection(),
        //     });
        // });

        this.sequencers.forEach((item) => {
            item.cleanCachedId();
        });
    }

    /**
     * @property {(HandleSequencer|HandleMasterSequencer)} sequencer
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myTimeline.add(mySequencer);
     * myTimeline.add(myMasterSequencer);
     *
     *
     * ```
     *
     * @description
     * Add the instance of a sequencer | masterSequencer to the timeline
     */
    add(sequencer = {}) {
        sequencer.setStretchFactor(this.duration);
        this.sequencers.push(sequencer);

        return this;
    }

    setDuration(duration) {
        this.duration = duration;

        return this;
    }

    resetSequencerLastValue() {
        this.sequencers.forEach((item) => item.resetLastValue());
    }

    /**
     * @return {Boolean} Active status
     *
     * @example
     * ```js
     * const isActive = myTimeline.isActive();
     *
     *
     * ```
     *
     * @description
     * Return active status
     */
    isActive() {
        return !this.isStopped;
    }

    /**
     * @return {Boolean} Pause status
     *
     * @example
     * ```js
     * const isPaused = myTimeline.isPaused();
     *
     *
     * ```
     *
     * @description
     * Return pause status
     */
    isPaused() {
        return this.isInPause;
    }

    /**
     * @returns {import('../utils/constant.js').directionStringTypes}
     *
     * @example
     * ```js
     * myTimeline.getDirection();
     *
     *
     * ```
     *
     * @description
     * Return direction forward|backward|none
     */
    getDirection() {
        if (this.isStopped) return directionConstant.NONE;

        return this.isReverse
            ? directionConstant.BACKWARD
            : directionConstant.FORWARD;
    }

    /**
     * @returns {Number} Current time
     *
     * @example
     * ```js
     * myTimeline.getTime();
     *
     *
     * ```
     *
     * @description
     * Get current time
     */
    getTime() {
        return this.currentTime;
    }

    /**
     * @typedef {Object} syncTimelineLoopType
     * @prop {number} loop
     **/

    /**
     * @param {function(import('../utils/constant.js').directionTypes & syncTimelineLoopType):void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     *```js
     * const unsubscribeOnLoopEnd = myTimeline.onLoopEnd(({direction, loop})=>{
     *      /// code
     * })
     * unsubscribeOnLoopEnd();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of each cycle
     * <br/>
     */
    onLoopEnd(cb = () => {}) {
        this.callbackLoop.push({ cb, id: this.callbackId });
        const cbId = this.callbackId;
        this.callbackId++;

        return () => {
            this.callbackLoop = this.callbackLoop.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @param {function():void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     *```js
     * const unsubscribeOnComplete = myTimeline.onComplete(() => {
     *      /// code
     * })
     * unsubscribeOnComplete();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of timeline
     * <br/>
     */
    onComplete(cb = () => {}) {
        this.callbackComplete.push({ cb, id: this.callbackId });
        const cbId = this.callbackId;
        this.callbackId++;

        return () => {
            this.callbackComplete = this.callbackComplete.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @typedef {Object} syncTimelineTimeType
     * @prop {Number} time
     **/

    /**
     * @param {function(import('../utils/constant.js').directionTypes & syncTimelineTimeType):void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     *```js
     * const unsubscribeOnUpdate = myTimeline.onUpdate(({direction, time}) => {
     *      /// code
     * })
     * unsubscribeOnUpdate();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of timeline
     * <br/>
     */
    onUpdate(cb = () => {}) {
        this.callbackOnUpdate.push({ cb, id: this.callbackId });
        const cbId = this.callbackId;
        this.callbackId++;

        return () => {
            this.callbackOnUpdate = this.callbackOnUpdate.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @description
     * Destroy timeline and all the sequencer
     * <br/>
     */
    destroy() {
        this.sequencers.forEach((item) => item.destroy());
        this.sequencers = [];
        this.callbackOnUpdate = [];
        this.callbackLoop = [];
        this.callbackComplete = [];
    }
}
