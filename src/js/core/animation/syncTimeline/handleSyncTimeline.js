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

export class HandleSyncTimeline {
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
        this.endTime = 0;
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

        // callbackLoop on complete
        this.callbackId = 0;
        this.callbackLoop = [];
        this.callbackComplete = [];
    }

    updateTime(time, fps, shouldRender) {
        if (this.isStopped || this.fpsIsInLoading) return;

        // If loop anitcipate by half frame ( in millsenconds ) next loop so we a have more precise animation
        const frameThreshold =
            !this.repeat ||
            (this.repeat >= 2 && this.loopCounter === this.repeat - 1)
                ? 0
                : 1000 / fps / 2;

        if (this.pauseStatus) {
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

        if (!this.pauseStatus) {
            this.endTime = clamp(partial, 0, this.duration);

            // When come from playReverse skip first frame becouse is 0
            if (!this.skipFirstRender) {
                if (shouldRender) {
                    this.sequencers.forEach((item) => {
                        item.draw({
                            partial: this.endTime,
                            isLastDraw: false,
                            useFrame: true,
                            direction: this.getDirection(),
                        });
                    });
                }
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
            const endTime = this.endTime;
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
            this.endTime = this.duration;
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

    getDirection() {
        return this.isReverse
            ? directionConstant.BACKWARD
            : directionConstant.FORWARD;
    }

    goToNextFrame() {
        handleFrame.add(() => {
            handleNextTick.add(({ time, fps, shouldRender }) => {
                // Prevent fire too many raf
                if (!this.fpsIsInLoading)
                    this.updateTime(time, fps, shouldRender);
            });
        });
    }

    resetTime() {
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.endTime = 0;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
    }

    /**
     * Find label tha match the occurrency and return the time
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
     * Control play on forward direction
     */
    play() {
        if (this.fpsIsInLoading) return;

        this.playFromTime();
        return this;
    }

    playFrom(value) {
        if (this.fpsIsInLoading) return;

        const isNumber = storeType.isNumber(value);
        const currentTime = isNumber ? value : this.getTimeFromLabel(value);
        this.playFromTime(currentTime);
        return this;
    }

    playFromTime(time = 0) {
        // Reset sequancer callback add function state
        this.resetSequencerLastValue();
        this.resetTime();

        /*
         * Set time
         */
        this.endTime = time;
        this.timeAtReverseBack = -this.endTime;

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
     * Control play on backward direction
     */
    playFromReverse(value) {
        if (this.fpsIsInLoading) return;

        const isNumber = storeType.isNumber(value);
        const currentTime = isNumber ? value : this.getTimeFromLabel(value);
        this.playFromTimeReverse(currentTime, true);
        return this;
    }

    playReverse() {
        if (this.fpsIsInLoading) return;

        this.playFromTimeReverse(this.duration, true);
        return this;
    }

    playFromTimeReverse(time = 0) {
        // Reset sequancer callback add function state
        this.resetSequencerLastValue();

        /*
         * Set time
         */
        this.timeElapsed = time;
        this.endTime = time;
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
                    this.pauseStatus = false;
                    this.loopCounter = 0;
                    this.updateTime(time, fps, shouldRender);
                });
            });
        });
    }

    pause() {
        if (this.isStopped || this.pauseStatus || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.pauseStatus = true;
    }

    resume() {
        if (this.isStopped || !this.pauseStatus || this.fpsIsInLoading) return;

        this.isStopped = false;
        this.pauseStatus = false;
    }

    reverse() {
        if (this.isStopped || this.pauseStatus || this.fpsIsInLoading) return;

        // Reset sequancer callback add function state
        this.resetSequencerLastValue();
        this.isReverse = !this.isReverse;
        if (this.isReverse) {
            this.timeAtReverse = this.timeElapsed;
        } else {
            this.timeAtReverseBack += this.timeElapsed - this.endTime;
        }
    }

    stop() {
        this.isStopped = true;
        this.pauseStatus = false;

        // TO DO: con lo stagger il render del last frame ( es senza translate3d)
        // va in conflitto con cleanCachedId

        // Fire callbackLoop onStop of each sequencr
        // this.sequencers.forEach((item) => {
        //     item.draw({
        //         partial: this.endTime,
        //         isLastDraw: true,
        //         useFrame: true,
        //         direction: this.getDirection(),
        //     });
        // });

        this.sequencers.forEach((item) => {
            item.cleanCachedId();
        });
    }

    add(sequencer) {
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

    onLoopEnd(cb) {
        this.callbackLoop.push({ cb, id: this.callbackId });
        const cbId = this.callbackId;
        this.callbackId++;

        return () => {
            this.callbackLoop = this.callbackLoop.filter(
                (item) => item.id !== cbId
            );
        };
    }

    onComplete(cb) {
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
     * Remove all reference from tween
     */
    destroy() {
        this.sequencers = [];
        this.callbackLoop = [];
        this.callbackComplete = [];
    }
}
