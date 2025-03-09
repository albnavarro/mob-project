// @ts-check

import { clamp } from '../utils/animationUtils.js';
import { syncTimelineLabelWarning } from '../utils/warning.js';
import {
    durationIsValid,
    repeatIsValid,
    valueIsBooleanAndReturnDefault,
} from '../utils/tweenAction/tweenValidation.js';
import { MobCore } from '../../../mobCore/index.js';
import { directionConstant } from '../utils/timeline/timelineConstant.js';
import { fpsLoadedLog } from '../utils/fpsLogInizialization.js';

export default class MobSyncTimeline {
    /**
     * @param {import('./type').SyncTimeline} data
     *
     * @example
     * ```javascript
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
     * ```javascript
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
        /**
         * @private
         * @type {number}
         */
        this.duration = durationIsValid(data?.duration);

        /**
         * @private
         * @type {boolean}
         */
        this.yoyo = valueIsBooleanAndReturnDefault(
            data?.yoyo,
            'syncTimeline: yoyo',
            false
        );

        /**
         * @private
         * @type {number}
         */
        this.repeat = repeatIsValid(data?.repeat);

        /**
         * @private
         * @type {import('./type').SyncTimelineSequencers[]}
         */
        this.sequencers = [];

        /**
         * @private
         * @type {number}
         */
        this.startTime = 0;

        /**
         * @private
         * @type {number}
         */
        this.timeElapsed = 0;

        /**
         * @private
         * @type {number}
         */
        this.currentTime = 0;

        /**
         * @private
         * @type {number}
         */
        this.pauseTime = 0;

        /**
         * @private
         * @type {number}
         */
        this.timeAtReverse = 0;

        /**
         * @private
         * @type {number}
         */
        this.timeAtReverseBack = 0;

        /**
         * @private
         * @type {boolean}
         */
        this.isReverse = false;

        /**
         * @private
         * @type {boolean}
         */
        this.startReverse = false;

        /**
         * @private
         * @type {boolean}
         */
        this.isPlayngReverse = false;

        /**
         * @private
         * @type {number}
         */
        this.loopCounter = 0;

        /**
         * @private
         * @type {number}
         */
        this.loopIteration = 0;

        /**
         * @private
         * @type {number}
         */
        this.minLoopIteration = 10;

        /**
         * @private
         * @type {boolean}
         */
        this.isStopped = true;

        /**
         * @private
         * @type {boolean}
         */
        this.skipFirstRender = false;

        /**
         * @private
         * @type {boolean}
         */
        this.completed = false;

        /**
         * @private
         * @type {boolean}
         */
        this.fpsIsInLoading = false;

        /**
         * @private
         * @type {boolean}
         */
        this.isInPause = false;

        /**
         * @private
         * @type {number}
         */
        this.callbackId = 0;

        /**
         * @private
         * @type {import('./type').SyncTimelineEvent<{direction: import('../utils/timeline/type').DirectionType, loop:number}>[]}
         */
        this.callbackLoop = [];

        /**
         * @private
         * @type {import('./type').SyncTimelineEvent<void>[]}
         */
        this.callbackComplete = [];

        /**
         * @private
         * @type {import('./type').SyncTimelineEvent<{time:number,direction:import('../utils/timeline/type').DirectionType }>[]}
         */
        this.callbackOnUpdate = [];

        /**
         * @private
         * @type{((value:any) => void)|undefined}
         */
        this.currentResolve = undefined;

        /**
         * @private
         * @type{((value:any) => void)|undefined}
         */
        this.currentReject = undefined;
    }

    /**
     * @param {number} time
     * @param {number} fps
     */
    #updateTime(time, fps) {
        if (this.isStopped || this.fpsIsInLoading) return;

        // If loop anitcipate by half frame ( in milliseconds ) next loop so we a have more precise animation
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

        this.timeElapsed = Math.trunc(
            time - this.startTime - this.pauseTime - this.timeAtReverseBack
        );

        const partial = this.isReverse
            ? this.timeAtReverse - (this.timeElapsed - this.timeAtReverse)
            : this.timeElapsed;

        if (!this.isInPause) {
            this.currentTime = clamp(partial, 0, this.duration);

            // When come from playReverse skip first frame because is 0
            if (!this.skipFirstRender) {
                this.sequencers.forEach((item) => {
                    item.draw({
                        partial: this.currentTime,
                        isLastDraw: false,
                        useFrame: true,
                        direction: this.getDirection(),
                    });
                });

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
            this.#goToNextFrame();
            return;
        }

        // Reset sequancer callback add function state
        this.#resetSequencerLastValue();

        /*
         * Start revere animation
         * In start reverse the first framme jump directly here
         **/
        if (this.startReverse) {
            this.isReverse = true;
            this.timeAtReverse = 0;
            this.timeAtReverseBack = 0;
            this.startReverse = false;
            this.#goToNextFrame();
            return;
        }

        /*
         * Store direction value before chengee during nextFrame
         **/
        const direction = this.getDirection();
        MobCore.useNextFrame(() => {
            /*
             *
             * Prevent multiple fire of complete event
             * Send direction BACKWARD || FORWARD as argument
             * If loop is too fast consider end of loop invalid
             * Prevent error from cycle that start from end
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
                // check end timeline use the right value not reset
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
            this.#resetTime();
            this.startTime = time;
            if (this.isReverse) this.isReverse = false;

            // Fire last callback on Complete
            this.callbackComplete.forEach(({ cb }) => cb());
            if (this.currentResolve) this.currentResolve(true);
            return;
        }

        /**
         * In yoyo mode time line have to reverst at the end of cycle
         **/
        if (this.yoyo) {
            this.reverse();
            this.#goToNextFrame();
            return;
        }

        /**
         * Reverse playing
         **/
        if (this.isPlayngReverse) {
            this.#resetTime();
            this.startTime = time;
            if (!this.isReverse) this.isPlayngReverse = !this.isPlayngReverse;
            this.timeElapsed = this.duration;
            this.currentTime = this.duration;
            this.pauseTime = this.duration;
            this.#goToNextFrame();
            return;
        }

        /**
         * Default playing
         **/
        this.#resetTime();
        this.startTime = time;
        if (this.isReverse) this.isPlayngReverse = !this.isPlayngReverse;
        this.#goToNextFrame();
    }

    /**
     * @returns {void}
     */
    #goToNextFrame() {
        MobCore.useFrame(() => {
            MobCore.useNextTick(({ time, fps }) => {
                // Prevent fire too many raf
                if (!this.fpsIsInLoading) this.#updateTime(time, fps);
            });
        });
    }

    /**
     * @returns {void}
     */
    #resetTime() {
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.currentTime = 0;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
    }

    /**
     * @param {string} label
     * @returns {number}
     */
    #getTimeFromLabel(label) {
        const labelObj = this.sequencers.reduce(
            (previous, current) => {
                const currentLabels = current.getLabels();
                const labelsMatched = currentLabels.find(
                    ({ name: currentName }) => currentName === label
                );

                return labelsMatched || previous;
            },
            { name: '', time: 0 }
        );

        if (!labelObj) syncTimelineLabelWarning(label);

        return labelObj.time;
    }

    /**
     * @returns {void}
     */
    #rejectPromise() {
        if (this.currentReject) {
            this.currentReject(MobCore.ANIMATION_STOP_REJECT);
            this.currentReject = undefined;
        }
    }

    /**
     * @type {import('./type').SyncTimelinePlay}
     *
     * @description
     * Plays the timeline starting from the initial value
     * With useCurrent set to true and with the timeline active, it will reverse the direction from the current value if it is scrolling in reverse, otherwise it will continue in the current direction.
     * With useCurrent set to false (default) the animation will always start from frame 0 towards the final value.
     */
    play(props = {}) {
        return new Promise((resolve, reject) => {
            const useCurrent = props?.useCurrent;
            if (this.fpsIsInLoading) return;

            this.#rejectPromise();
            this.currentResolve = resolve;
            this.currentReject = reject;

            /**
             * If is running and useCurrent is true move from current time value
             */
            if (!this.isStopped && !this.isReverse && useCurrent) return;
            if (!this.isStopped && this.isReverse && useCurrent) {
                this.reverse();
                return;
            }

            this.#playFromTime();
        });
    }

    /**
     * @type {import('./type').SyncTimelinePlayFrom} value
     *
     * @example
     * ```javascript
     * myTimeline.playFrom(1000).then(() => {
     *      // code
     * })

     * myTimeline.playFrom('myLabel').then(() => {
     *      // code
     * })

     *
     *
     * ```
     *
     * @description
     * Plays the timeline forward starting from the specific time or from a label defined in a Handle Sequencer | HandleMasterSequencer instance
     */
    playFrom(value = 0) {
        return new Promise((resolve, reject) => {
            if (this.fpsIsInLoading) return;

            const isNumber = MobCore.checkType(Number, value);
            // @ts-ignore
            const labelTime = isNumber ? value : this.#getTimeFromLabel(value);

            this.#rejectPromise();
            this.currentResolve = resolve;
            this.currentReject = reject;
            // @ts-ignore
            this.#playFromTime(labelTime);
        });
    }

    /**
     * @param {number} time
     */
    #playFromTime(time = 0) {
        // Reset sequancer callback add function state
        this.#resetSequencerLastValue();
        this.#resetTime();

        /*
         * Set time
         */
        this.currentTime = time;
        this.timeAtReverseBack = -this.currentTime;

        /*
         * Generic prop
         */
        this.isPlayngReverse = false;
        this.loopIteration = 0;

        /*
         * Prevent multiple firing
         */
        this.fpsIsInLoading = true;
        this.#startAnimation(time);
    }

    /**
     * @type {import('./type').syncTimelinePlayFromReverse} value
     *
     * @example
     * ```javascript
     * myTimeline.playFromReverse(1000).then(() => {
     *      // code
     * })

     * myTimeline.playFromReverse('myLabel').then(() => {
     *      // code
     * })

     *
     *
     * ```
     *
     * @description
     * Plays the timeline backward starting from the specific time or from a label defined in a Handle Sequencer | HandleMasterSequencer instance
     */
    playFromReverse(value) {
        return new Promise((resolve, reject) => {
            if (this.fpsIsInLoading) return;

            const isNumber = MobCore.checkType(Number, value);
            // @ts-ignore
            const labelTime = isNumber ? value : this.#getTimeFromLabel(value);

            this.#rejectPromise();
            this.currentResolve = resolve;
            this.currentReject = reject;
            // @ts-ignore
            this.#playFromTimeReverse(labelTime, true);
        });
    }

    /**
     * @type {import('./type').SyncTimelinePlayReverse} 
     *
     * @example
     * ```javascript
     * myTimeline.playReverse({
     *      useCurrent: true
     * }).then(() => {
     *      // code
     * })

     *
     *
     * ```
     *
     * @description
     * Plays the timeline starting from the end value
     * With useCurrent set to true and with the timeline active, it will reverse the direction from the current value if it is scrolling in reverse, otherwise it will continue in the current direction.
     * With useCurrent set to false (default) the animation will always start from the final value towards the initial value.
     */
    playReverse(props = {}) {
        return new Promise((resolve, reject) => {
            const useCurrent = props?.useCurrent;
            if (this.fpsIsInLoading) return;

            this.#rejectPromise();
            this.currentResolve = resolve;
            this.currentReject = reject;

            /**
             * If is running and useCurrent is true move from current time value
             */
            if (!this.isStopped && this.isReverse && useCurrent) return;
            if (!this.isStopped && !this.isReverse && useCurrent) {
                this.reverse();
                return;
            }

            // @ts-ignore
            this.#playFromTimeReverse(this.duration, true);
        });
    }

    /**
     * @param {number} time
     * @returns {void}
     */
    #playFromTimeReverse(time = 0) {
        // Reset sequancer callback add function state
        this.#resetSequencerLastValue();

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
        this.loopIteration = 0;

        /*
         * Prevent multiple firing
         */
        this.fpsIsInLoading = true;
        this.#startAnimation(time);
    }

    /**
     * @description
     * Find label than match the occurrency and return the time
     *
     * @param {number} partial
     * @returns {Promise<any>}
     */
    async #startAnimation(partial) {
        if (this.repeat === 0) return;

        const { averageFPS } = await MobCore.useFps();

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

        MobCore.useFrame(() => {
            MobCore.useNextTick(({ time, fps }) => {
                this.startTime = time;
                this.fpsIsInLoading = false;
                this.isStopped = false;
                this.isInPause = false;
                this.loopCounter = 0;
                this.#updateTime(time, fps);
            });
        });
    }

    /**
     * @type {import('./type').SyncTimelinePause}
     */
    pause() {
        if (this.isStopped || this.isInPause || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.isInPause = true;
    }

    /**
     * @type {import('./type').SyncTimelineResume}
     */
    resume() {
        if (this.isStopped || !this.isInPause || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.isInPause = false;
    }

    /**
     * @type {import('./type').SyncTimelineReverse}
     */
    reverse() {
        if (this.isStopped || this.isInPause || this.fpsIsInLoading) return;

        // Reset sequancer callback add function state
        this.#resetSequencerLastValue();
        this.isReverse = !this.isReverse;
        if (this.isReverse) {
            this.timeAtReverse = this.timeElapsed;
        } else {
            this.timeAtReverseBack += this.timeElapsed - this.currentTime;
        }
    }

    /**
     * @type {import('./type').SyncTimelineStop}
     * @returns {void}
     */
    stop({ clearCache = true } = {}) {
        this.isStopped = true;
        this.isInPause = false;
        this.#rejectPromise();

        if (clearCache) {
            this.sequencers.forEach((item) => {
                item.cleanCachedId();
            });
            return;
        }

        /**
         * Con lo stagger il render del last frame ( es senza translate3d)
         * va in conflitto con cleanCached
         * Il render parziale viene perso.
         * Utitlizziamo il render onStop solo se clarCahe é diabilitato cosi
         * da far finire in maniera naturale il tween di ogni stagger.
         */

        // Fire callbackLoop onStop of each sequencr
        this.sequencers.forEach((item) => {
            item.draw({
                partial: this.currentTime,
                isLastDraw: true,
                useFrame: true,
                direction: this.getDirection(),
            });
        });
    }

    /**
     * @type {import('./type').SyncTimelineAdd}
     *
     * @example
     * ```javascript
     * myTimeline.add(mySequencer);
     * myTimeline.add(myMasterSequencer);
     *
     *
     * ```
     *
     * @description
     * Add the instance of a sequencer | masterSequencer to the timeline
     */
    add(sequencer) {
        sequencer.setStretchFactor(this.duration);
        this.sequencers.push(sequencer);

        return this;
    }

    /**
     * @type {import('./type').SyncTimelineSetDuration}
     */
    setDuration(duration) {
        this.duration = duration;

        return this;
    }

    /**
     * @returns {void}
     */
    #resetSequencerLastValue() {
        this.sequencers.forEach((item) => item.resetLastValue());
    }

    /**
     * @type {import('./type').SyncTimelineIsActive}
     *
     * @example
     * ```javascript
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
     * @type {import('./type').SyncTimelineIsPaused}
     *
     * @example
     * ```javascript
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
     * @type {import('./type').SyncTimelineGetDirection}
     *
     * @example
     * ```javascript
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
     * @type {import('./type').SyncTimelineTime}
     *
     * @example
     * ```javascript
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
     * @type {import('./type').SyncTimelineOnLoopEnd}
     *
     * @example
     *```javascript
     * const unsubscribeOnLoopEnd = myTimeline.onLoopEnd(({direction, loop})=>{
     *      /// code
     * })
     * unsubscribeOnLoopEnd();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of each cycle
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
     * @type {import('./type').SyncTimelineOnComplete}
     *
     * @example
     *```javascript
     * const unsubscribeOnComplete = myTimeline.onComplete(() => {
     *      /// code
     * })
     * unsubscribeOnComplete();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of timeline
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
     * @type {import('./type').SyncTimelineOnUpdate}
     *
     * @example
     *```javascript
     * const unsubscribeOnUpdate = myTimeline.onUpdate(({direction, time}) => {
     *      /// code
     * })
     * unsubscribeOnUpdate();
     *
     *
     * ```
     * @description
     * Callback thrown at each frame during the animation
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
     */
    destroy() {
        this.stop();
        this.sequencers.forEach((item) => item.destroy());
        this.sequencers = [];
        this.callbackOnUpdate = [];
        this.callbackLoop = [];
        this.callbackComplete = [];
    }
}
