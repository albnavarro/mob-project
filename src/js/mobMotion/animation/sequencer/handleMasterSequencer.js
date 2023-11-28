// @ts-check

/**
 * @description
 *
 * Support class for grouping multiple sequencers.
 * Very useful when generating sequencers dynamically, such as through the use of a createStagger.
 * The following example uses a timeline but the same can be done using a scrollTrigger
 *
 *
 * @example
 *
 * ```javascript
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
        /**
         * @trype {string}
         */
        this.type = 'sequencer';

        /**
         * @type {import("./type").masterSequencerItem[]}
         */
        this.children = [];
    }

    /**
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {boolean} obj.useFrame
     *
     * @returns {void}
     */
    draw({ partial, isLastDraw, useFrame }) {
        this.children.forEach((item) => {
            item.draw({ partial, isLastDraw, useFrame });
        });
    }

    /**
     * @param {import("./type").masterSequencerItem} item
     * @returns {void}
     */
    add(item) {
        this.children.push(item);
    }

    /**
     * @returns {void}
     */
    inzializeStagger() {
        this.children.forEach((item) => {
            item.inzializeStagger();
        });
    }

    /**
     * @param {number} val
     * @returns {void}
     */
    setDuration(val) {
        this.children.forEach((item) => {
            item.setDuration(val);
        });
    }

    /**
     * @returns {void}
     */
    getDuration() {
        return this.children.length > 0 ? this.children[0].getDuration() : 0;
    }

    /**
     * @param {number} val
     * @returns {void}
     */
    setStretchFactor(val) {
        this.children.forEach((item) => {
            item.setStretchFactor(val);
        });
    }

    /**
     * @returns {Array<string>}
     */
    getLabels() {
        return this.children.flatMap((item) => item.getLabels());
    }

    /**
     * @returns {void}
     */
    resetLastValue() {
        this.children.forEach((item) => item.resetLastValue());
    }

    /**
     * @returns {void}
     */
    disableStagger() {
        this.children.forEach((item) => {
            item.disableStagger();
        });
    }

    /**
     * @returns {void}
     */
    cleanCachedId() {
        this.children.forEach((item) => {
            item.cleanCachedId();
        });
    }

    /**
     * @returns {string}
     */
    getType() {
        return this.type;
    }

    /**
     * @returns {void}
     */
    destroy() {
        this.children.forEach((item) => {
            item.destroy();
        });
        this.children = [];
    }
}
