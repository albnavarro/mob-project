// import { SimpleStore } from '../store/classVersion/simpleStore';
import { mobStore } from '../store/mobStore.js';

export const eventStore = mobStore({
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
});
