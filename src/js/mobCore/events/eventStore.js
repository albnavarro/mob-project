// import { SimpleStore } from '../store/simpleStore';
import { mobStore } from '../store';

/**
 * @import { MobStoreParams, MobStoreReturnType} from "../../mobCore/store/type".MobStore;
 **/

/** @type{MobStoreReturnType<import('./type').EventStore>} */
export const eventStore = mobStore(
    /** @type{MobStoreParams<import('./type').EventStore>} */
    ({
        /**
         * @description
         * Use passive event.
         */
        usePassive: () => ({
            value: true,
            type: Boolean,
        }),

        /**
         * @description
         * Frame Event
         */
        currentFrame: () => ({
            value: 0,
            type: Number,
        }),

        /**
         * @description
         * Initial fps value
         */
        instantFps: () => ({
            value: 60,
            type: Number,
        }),

        /**
         * @description
         * Trigger nexFrame
         */
        requestFrame: () => ({
            value: () => {},
            type: Function,
        }),

        /**
         * @description
         * Send nextTick on next loop
         */
        deferredNextTick: () => ({
            value: true,
            type: Boolean,
        }),

        /**
         * @description
         * Throttle scroll value
         */
        throttle: () => ({
            value: 60,
            type: Number,
        }),

        /**
         * @description
         * Mouse wheell spinY max value ( 2.5 | -2.5 )
         */
        spinYMaxValue: () => ({
            value: 2.5,
            type: Number,
        }),

        /**
         * @description
         * Mouse wheell spinX max value ( 2.5 | -2.5 )
         */
        spinXMaxValue: () => ({
            value: 2.5,
            type: Number,
        }),
    })
);
