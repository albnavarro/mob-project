// @ts-check

/**
 * Support class for grouping multiple sequencers. Very useful when generating sequencers dynamically, such as through
 * the use of a createStagger. The following example uses a timeline but the same can be done using a scrollTrigger
 *
 * @example
 *     ```javascript
 *     cont masterSequencer = new MobMasterSequencer();
 *     const staggers = mobbu.createStaggers({})
 *     staggers.forEach(({ item, start, end, index }) => {
 *         const sequencer = mobbu
 *             .createSequencer({ ... })
 *             .goTo({ ... }, { start, end ...});
 *         sequencer.subscribe(({ ... }) => { ... });
 *         masterSequencer.add(sequencer);
 *     });
 *     const timeline = mobbu.createSyncTimeline({}).add(masterSequencer)
 *     ```;
 */
export default class MobMasterSequencer {
    /**
     * @trype {string}
     */
    #type = 'sequencer';

    /**
     * @type {import('./type').MasterSequencerItem[]}
     */
    #children;

    constructor() {
        this.#children = [];
    }

    /**
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {boolean} obj.useFrame
     * @returns {void}
     */
    draw({ partial, isLastDraw, useFrame }) {
        for (const item of this.#children) {
            item.draw({ partial, isLastDraw, useFrame });
        }
    }

    /**
     * @param {import('./type').MasterSequencerItem} item
     * @returns {void}
     */
    add(item) {
        this.#children.push(item);
    }

    /**
     * @returns {void}
     */
    inzializeStagger() {
        for (const item of this.#children) {
            item.inzializeStagger();
        }
    }

    /**
     * @param {number} val
     * @returns {void}
     */
    setDuration(val) {
        for (const item of this.#children) {
            item.setDuration(val);
        }
    }

    /**
     * @returns {number}
     */
    getDuration() {
        return this.#children.length > 0 ? this.#children[0].getDuration() : 0;
    }

    /**
     * @param {number} val
     * @returns {void}
     */
    setStretchFactor(val) {
        for (const item of this.#children) {
            item.setStretchFactor(val);
        }
    }

    /**
     * @returns {import('./type').LabelType[]}
     */
    getLabels() {
        return this.#children.flatMap((item) => item.getLabels());
    }

    /**
     * @returns {void}
     */
    resetLastValue() {
        for (const item of this.#children) item.resetLastValue();
    }

    /**
     * @returns {void}
     */
    disableStagger() {
        for (const item of this.#children) {
            item.disableStagger();
        }
    }

    /**
     * @returns {void}
     */
    cleanCachedId() {
        for (const item of this.#children) {
            item.cleanCachedId();
        }
    }

    /**
     * @returns {void}
     */
    freezeCachedId() {
        for (const item of this.#children) {
            item.freezeCachedId();
        }
    }

    /**
     * @returns {void}
     */
    unFreezeCachedId() {
        for (const item of this.#children) {
            item.unFreezeCachedId();
        }
    }

    /**
     * @returns {string}
     */
    getType() {
        return this.#type;
    }

    /**
     * @returns {void}
     */
    destroy() {
        for (const item of this.#children) {
            item.destroy();
        }
        this.#children = [];
    }
}
