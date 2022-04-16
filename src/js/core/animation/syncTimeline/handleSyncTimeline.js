import { getTime } from '../../utils/time.js';
import {
    handleFrame,
    handleNextFrame,
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
        this.loop = data?.loop ? data.loop : false;
        this.yoyo = data?.yoyo ? data.yoyo : false;
        this.squencers = [];
    }

    updateTime() {
        if (this.isStopped) return;

        const now = getTime();

        if (this.pauseStatus) {
            this.pauseTime = now - this.startTime - this.timeElapsed;
        }

        this.timeElapsed = parseInt(
            now - this.startTime - this.pauseTime - this.timeAtReverseBack
        );

        const partial = !this.isReverse
            ? this.timeElapsed
            : this.timeAtReverse - (this.timeElapsed - this.timeAtReverse);

        if (!this.pauseStatus) {
            this.endTime = clamp(partial, 0, this.duration);

            // When come from playReverse skip first frame becouse is 0
            if (!this.skipFirstRender) {
                this.squencers.forEach((item, i) => {
                    item.draw({ partial: this.endTime, isLastDraw: false });
                });
            }
        }

        this.skipFirstRender = false;

        if (partial <= this.duration && partial >= 0 && !this.isStopped) {
            // Next frame
            handleNextFrame.add(() => this.updateTime());
        } else {
            // START reverse
            if (this.startReverse) {
                this.isReverse = true;
                this.timeAtReverse = 0;
                this.startReverse = false;
                handleNextFrame.add(() => this.updateTime());
                return;
            }

            if (partial >= this.duration) {
                console.log('completed');
                // complete callback qui
            }

            if (!this.loop) {
                this.isStopped = true;
                this.reset();
                if (this.isReverse) this.isReverse = false;
            } else {
                if (this.yoyo) {
                    // Invert
                    this.isReverse = !this.isReverse;

                    if (this.isReverse) {
                        this.timeAtReverse = this.timeElapsed;
                    } else {
                        this.reset();
                    }
                } else {
                    // If come from playReverse and is not yoyo go back in right direction
                    if (this.isReverse) {
                        this.reverse();
                    } else {
                        this.reset();
                    }
                }
                handleNextFrame.add(() => this.updateTime());
            }
        }
    }

    reset() {
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.endTime = 0;
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
        this.startTime = getTime();
    }

    play() {
        this.reset();
        this.isStopped = false;
        this.pauseStatus = false;
        this.isReverse = false;
        this.renderFirstFrame();
        handleNextFrame.add(() => this.updateTime());
    }

    playReverse() {
        // Jump to last time
        this.timeElapsed = this.duration;
        this.endTime = this.duration;
        this.pauseTime = this.duration;
        // reset
        this.timeAtReverse = 0;
        this.timeAtReverseBack = 0;
        this.startTime = getTime();
        this.isStopped = false;
        this.pauseStatus = false;

        // playReverse props
        this.startReverse = true;
        this.skipFirstRender = true;

        this.renderlastFrame();
        handleNextFrame.add(() => this.updateTime());
    }

    pause() {
        if (this.isStopped || this.pauseStatus) return;

        this.isStopped = false;
        this.pauseStatus = true;
    }

    resume() {
        if (this.isStopped || !this.pauseStatus) return;

        this.isStopped = false;
        this.pauseStatus = false;
    }

    reverse() {
        if (this.isStopped || this.pauseStatus) return;

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
    }

    renderFirstFrame() {
        // Place item at the end without stagger, immediatly
        handleFrame.add(() => {
            this.squencers.forEach((item, i) => {
                item.disableStagger();
                item.draw({
                    partial: 0,
                    isLastDraw: false,
                });
            });
        });
    }

    renderlastFrame() {
        // Place item at the end without stagger, immediatly
        handleFrame.add(() => {
            this.squencers.forEach((item, i) => {
                item.disableStagger();
                item.draw({
                    partial: this.duration,
                    isLastDraw: false,
                });
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
}
