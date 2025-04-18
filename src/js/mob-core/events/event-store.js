// import { SimpleStore } from '../store/simpleStore';
import { mobStore } from '../store';

/**
 * @import {MobStoreParams, MobStoreReturnType} from "../store/type".MobStore;
 */

/** @type {MobStoreReturnType<import('./type').EventStore>} */
export const eventStore = mobStore(
    /** @type {MobStoreParams<import('./type').EventStore>} */
    ({
        /**
         * Use passive event.
         */
        usePassive: () => ({
            value: true,
            type: Boolean,
        }),

        /**
         * Frame Event
         */
        currentFrame: () => ({
            value: 0,
            type: Number,
        }),

        /**
         * Initial fps value
         */
        instantFps: () => ({
            value: 60,
            type: Number,
        }),

        /**
         * Trigger nexFrame
         */
        requestFrame: () => ({
            value: () => {},
            type: Function,
        }),

        /**
         * Send nextTick on next loop
         */
        deferredNextTick: () => ({
            value: true,
            type: Boolean,
        }),

        /**
         * Throttle scroll value
         */
        throttle: () => ({
            value: 60,
            type: Number,
        }),

        /**
         * Mouse wheell spinY max value ( 2.5 | -2.5 )
         */
        spinYMaxValue: () => ({
            value: 2.5,
            type: Number,
        }),

        /**
         * Mouse wheell spinX max value ( 2.5 | -2.5 )
         */
        spinXMaxValue: () => ({
            value: 2.5,
            type: Number,
        }),
    })
);
