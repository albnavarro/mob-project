/**
 * @description
 *
  Support class for grouping multiple sequencers.
  Very useful when generating sequencers dynamically, such as through the use of a createStagger.
  The following example uses a timeline but the same can be done using a scrollTrigger
 *
 *
 * @example
 *
 * ```js
 * cont masterSequencer = new HandleMasterSequencer();
 * const staggers = mobbu.createStaggers({})
 * staggers.forEach(({ item, start, end, index }) => {
 *     const sequencer = mobbu
 *         .createSequencer({ ... })
 *         .goTo({ ... }, { start, end ...});
 *     sequencer.subscribe(({ ... }) => { ... });
 *     masterSequencer.add(sequencer);
 * });
 * const timeline = mobbu.createSyncTimeline({}).add(masterSequencer)
 * ```
 */
export default class HandleMasterSequencer {
    constructor() {
        this.type = 'sequencer';
        this.children = [];
    }

    draw({ partial, isLastDraw, useFrame }) {
        this.children.forEach((item) => {
            item.draw({ partial, isLastDraw, useFrame });
        });
    }

    add(item) {
        this.children.push(item);
    }

    inzializeStagger() {
        this.children.forEach((item) => {
            item.inzializeStagger();
        });
    }

    setDuration(val) {
        this.children.forEach((item) => {
            item.setDuration(val);
        });
    }

    getDuration() {
        return this.children.length > 0 ? this.children[0].getDuration() : 0;
    }

    setStretchFactor(val) {
        this.children.forEach((item) => {
            item.setStretchFactor(val);
        });
    }

    getLabels() {
        return this.children.map((item) => item.getLabels()).flat();
    }

    resetLastValue() {
        this.children.forEach((item) => item.resetLastValue());
    }

    disableStagger() {
        this.children.forEach((item) => {
            item.disableStagger();
        });
    }

    cleanCachedId() {
        this.children.forEach((item) => {
            item.cleanCachedId();
        });
    }

    getType() {
        return this.type;
    }

    destroy() {
        this.children.forEach((item) => {
            item.destroy();
        });
        this.children = [];
    }
}
