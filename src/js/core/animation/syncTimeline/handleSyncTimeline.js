import {
    handleFrame,
    handleNextFrame,
    handleNextTick,
} from '../../events/rafutils/rafUtils.js';
import { clamp } from '../utils/animationUtils.js';

export class HandleSyncTimeline {
    constructor(data = {}) {
        this.startTime = null;
        this.timeElapsed = 0;
        this.endTime = 0;
        this.pauseTime = 0;
        this.duration = 1000;
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

        // Onlu one loop , prevent sideEffct of this.frameThreshold
        if (this.repeat === 1 || this.repeat === 0) {
            this.repeat = false;
        }

        // Callback on complete
        this.onCompleteId = 0;
        this.callback = [];
    }

    updateTime(timestamp, fps) {
        if (this.isStopped || this.isInInzializing) return;

        // If loop anitcipate by half frame ( in millsenconds ) next loop so we a have more precise animation
        const frameThreshold =
            !this.repeat ||
            (this.repeat >= 2 && this.loopCounter === this.repeat - 1)
                ? 0
                : 1000 / fps / 2;

        if (this.pauseStatus) {
            this.pauseTime =
                timestamp -
                this.startTime -
                this.timeElapsed -
                this.timeAtReverseBack;
        }

        this.timeElapsed = parseInt(
            timestamp - this.startTime - this.pauseTime - this.timeAtReverseBack
        );

        const partial = !this.isReverse
            ? this.timeElapsed
            : this.timeAtReverse - (this.timeElapsed - this.timeAtReverse);

        if (!this.pauseStatus) {
            this.endTime = clamp(partial, 0, this.duration);

            // When come from playReverse skip first frame becouse is 0
            if (!this.skipFirstRender) {
                this.squencers.forEach((item, i) => {
                    item.draw({
                        partial: this.endTime,
                        isLastDraw: false,
                        useFrame: true,
                    });
                });
            }
        }

        this.skipFirstRender = false;

        if (
            partial <= this.duration - frameThreshold &&
            partial >= 0 + frameThreshold &&
            !this.isStopped
        ) {
            this.completed = false;
            this.goToNextFrame();
        } else {
            // START reverse
            if (this.startReverse) {
                this.isReverse = true;
                this.timeAtReverse = 0;
                this.timeAtReverseBack = 0;
                this.startReverse = false;
                this.goToNextFrame();
                return;
            }

            // onComplete callback condition by direction of animation
            const onCompleteCondition = !this.isReverse
                ? partial >= this.duration - frameThreshold
                : partial <= 0 + frameThreshold;

            if (onCompleteCondition) {
                handleNextFrame.add(() => {
                    // Prevent multiple fire of complete event
                    // Send direction BACKWARD || FORWARD as argument
                    if (!this.isInInzializing && !this.completed) {
                        this.loopCounter++;
                        this.completed = true;

                        this.callback.forEach(({ cb }) =>
                            cb({
                                direction: this.getDirection(),
                                loop: this.loopCounter,
                            })
                        );
                    }
                });
            }

            if (!this.repeat || this.loopCounter === this.repeat - 1) {
                // Fire callback onStop of each sequencr
                // Prevent async problem, endTime back to start, so store the value
                const endTime = this.endTime;
                this.squencers.forEach((item, i) => {
                    item.draw({
                        partial: endTime,
                        isLastDraw: true,
                        useFrame: true,
                    });
                });

                this.isStopped = true;
                this.resetTime();
                this.startTime = timestamp;
                if (this.isReverse) this.isReverse = false;
            } else {
                if (this.yoyo) {
                    this.reverse();
                } else {
                    this.resetTime();
                    this.startTime = timestamp;

                    if (this.isPlayngReverse) {
                        if (!this.isReverse) {
                            this.isPlayngReverse = !this.isPlayngReverse;
                            if (this.isReverse) this.reverse();
                        }
                        this.timeElapsed = this.duration;
                        this.endTime = this.duration;
                        this.pauseTime = this.duration;
                    } else {
                        if (this.isReverse) {
                            this.isPlayngReverse = !this.isPlayngReverse;
                            if (!this.isReverse) this.reverse();
                        }
                    }
                }
                this.goToNextFrame();
            }
        }
    }

    getDirection() {
        return this.isReverse ? this.BACKWARD : this.FORWARD;
    }

    goToNextFrame() {
        handleFrame.add(() => {
            handleNextTick.add((timestamp, fps) => {
                // Prevent fire too many raf
                if (!this.isInInzializing) this.updateTime(timestamp, fps);
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
        if (this.isInInzializing) return;

        this.resetTime();
        this.isStopped = false;
        this.pauseStatus = false;
        this.isReverse = false;

        // While start isInInzializing fa fallire le altre raf
        this.isInInzializing = true;
        this.isPlayngReverse = false;
        this.loopCounter = 0;

        this.squencers.forEach((item, i) => {
            item.disableStagger();
            item.draw({
                partial: 0,
                isLastDraw: false,
                useFrame: true,
            });
        });

        handleFrame.add(() => {
            handleNextTick.add((timestamp, fps) => {
                this.startTime = timestamp;
                this.isInInzializing = false;
                this.updateTime(timestamp, fps);
            });
        });
    }

    playReverse() {
        if (this.isInInzializing) return;

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

        this.squencers.forEach((item, i) => {
            item.disableStagger();
            item.draw({
                partial: this.duration,
                isLastDraw: false,
                useFrame: true,
            });
        });

        handleFrame.add(() => {
            handleNextTick.add((timestamp, fps) => {
                this.isInInzializing = false;
                this.startTime = timestamp;
                this.updateTime(timestamp, fps);
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

        // Fire callback onStop of each sequencr
        this.squencers.forEach((item, i) => {
            item.draw({
                partial: this.endTime,
                isLastDraw: true,
                useFrame: true,
            });
        });
    }

    add(sequencer) {
        sequencer.setDuration(this.duration);
        this.squencers.push(sequencer);
    }

    setDuration(duration) {
        this.duration = duration;
    }

    onComplete(cb) {
        this.callback.push({ cb, id: this.onCompleteId });
        const cbId = this.onCompleteId;
        this.onCompleteId++;

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }

    destroy() {
        this.squencers = [];
    }
}
