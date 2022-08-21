import { loadFps } from '../../events/rafutils/loadFps.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextFrame } from '../../events/rafutils/handleNextFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { clamp } from '../utils/animationUtils.js';
import { handleSetUp } from '../../setup.js';
import { fpsLoadedLog } from '../utils/log.js';

export class HandleSyncTimeline {
    constructor(data = {}) {
        this.startTime = null;
        this.timeElapsed = 0;
        this.endTime = 0;
        this.pauseTime = 0;
        this.duration = data?.duration
            ? data.duration
            : handleSetUp.get('sequencer').duration;
        this.isStopped = true;
        this.isReverse = false;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
        this.skipFirstRender = false;
        this.repeat = data?.repeat ? data.repeat : false;
        this.yoyo = data?.yoyo ? data.yoyo : false;
        this.loopCounter = 0;
        this.squencers = [];
        this.completed = false;
        this.isPlayngReverse = false;
        this.BACKWARD = 'backward';
        this.FORWARD = 'forward';
        this.fpsInLoading = false;
        this.loopIteration = 0;
        this.minLoopIteration = 10;

        // Onlu one loop , prevent sideEffct of this.frameThreshold
        if (this.repeat === 1 || this.repeat === 0) {
            this.repeat = false;
        }

        // callbackLoop on complete
        this.callbackId = 0;
        this.callbackLoop = [];
        this.callbackComplete = [];
    }

    updateTime(time, fps, shouldRender) {
        if (this.isStopped || this.isInInzializing) return;

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
                    this.squencers.forEach((item) => {
                        item.draw({
                            partial: this.endTime,
                            isLastDraw: false,
                            useFrame: true,
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
                !this.isInInzializing &&
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
            this.squencers.forEach((item) => {
                item.draw({
                    partial: endTime,
                    isLastDraw: true,
                    useFrame: true,
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
        return this.isReverse ? this.BACKWARD : this.FORWARD;
    }

    goToNextFrame() {
        handleFrame.add(() => {
            handleNextTick.add(({ time, fps, shouldRender }) => {
                // Prevent fire too many raf
                if (!this.isInInzializing)
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

    play() {
        if (this.isInInzializing || this.fpsInLoading) return;

        this.resetTime();
        this.isStopped = false;
        this.pauseStatus = false;
        this.isReverse = false;

        // While start isInInzializing fa fallire le altre raf
        this.isInInzializing = true;
        this.isPlayngReverse = false;
        this.loopCounter = 0;

        // Prevent multiple play whild fps is loading
        this.fpsInLoading = true;
        this.startAnimation(0);
    }

    playReverse() {
        if (this.isInInzializing || this.fpsInLoading) return;

        // Jump to last time
        this.timeElapsed = this.duration;
        this.endTime = this.duration;
        this.pauseTime = this.duration;

        // reset
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
        this.isStopped = false;
        this.pauseStatus = false;
        this.isReverse = false;
        this.isPlayngReverse = true;
        this.loopCounter = 0;

        // playReverse props
        this.startReverse = true;
        this.skipFirstRender = true;

        // While start isInInzializing fa fallire le altre raf
        this.isInInzializing = true;

        // Prevent multiple play whild fps is loading
        this.fpsInLoading = true;
        this.startAnimation(this.duration);
    }

    startAnimation(partial) {
        loadFps().then(({ averageFPS }) => {
            fpsLoadedLog('sequencer', averageFPS);

            this.squencers.forEach((item) => {
                item.inzializeStagger();
                item.disableStagger();
                item.draw({
                    partial,
                    isLastDraw: false,
                    useFrame: true,
                });
            });

            handleFrame.add(() => {
                handleNextTick.add(({ time, fps, shouldRender }) => {
                    this.startTime = time;
                    this.isInInzializing = false;
                    this.fpsInLoading = false;
                    this.updateTime(time, fps, shouldRender);
                });
            });
        });
    }

    pause() {
        if (this.isStopped || this.pauseStatus || this.isInInzializing) return;

        this.isStopped = false;
        this.pauseStatus = true;
    }

    resume() {
        if (this.isStopped || !this.pauseStatus || this.isInInzializing) return;

        this.isStopped = false;
        this.pauseStatus = false;
    }

    reverse() {
        if (this.isStopped || this.pauseStatus || this.isInInzializing) return;

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

        // Fire callbackLoop onStop of each sequencr
        this.squencers.forEach((item) => {
            item.draw({
                partial: this.endTime,
                isLastDraw: true,
                useFrame: true,
            });
        });
    }

    add(sequencer) {
        sequencer.setStretchFactor(this.duration);
        this.squencers.push(sequencer);

        return this;
    }

    setDuration(duration) {
        this.duration = duration;

        return this;
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
        this.squencers = [];
        this.callbackLoop = [];
        this.callbackComplete = [];
    }
}
