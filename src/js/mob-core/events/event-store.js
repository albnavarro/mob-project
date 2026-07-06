// import { SimpleStore } from '../store/simpleStore';
import { mobStore } from '../store';

/**
 * @import {
 *   MobStoreParams,
 *   MobStoreReturnType
 * } from '../store/type'
 */

/** @type {MobStoreReturnType<import('./type').EventStore>} */
export const eventStore = mobStore(
    /** @type {MobStoreParams<import('./type').EventStore>} */
    ({
        /**
         * Use passive event.
         */
        usePassive: {
            __value: false,
            __type: Boolean,
        },

        /**
         * Frame Event
         */
        currentFrame: {
            __value: 0,
            __type: Number,
        },

        /**
         * Initial fps value
         */
        instantFps: {
            __value: 60,
            __type: Number,
        },

        /**
         * Trigger nexFrame
         */
        requestFrame: {
            __value: () => {},
            __type: Function,
        },

        /**
         * Send nextTick on next loop
         */
        deferredNextTick: {
            __value: true,
            __type: Boolean,
        },

        /**
         * Throttle scroll value
         */
        throttle: {
            __value: 60,
            __type: Number,
        },

        /**
         * Mouse wheell spinY max value ( 2.5 | -2.5 )
         */
        spinYMaxValue: {
            __value: 2.5,
            __type: Number,
        },

        /**
         * Mouse wheell spinX max value ( 2.5 | -2.5 )
         */
        spinXMaxValue: {
            __value: 2.5,
            __type: Number,
        },
    })
);
