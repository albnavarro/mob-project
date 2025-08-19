import { getUnivoqueId } from '../../utils';
import { eventStore } from '../event-store';

/**
 * Increment and decrement when we add or fire a item. hadleFrame use that to check if the requestAnimationFrame have to
 * go on. Indeicate fi there is frame to render.
 *
 * @type {number}
 */
let cacheCoutner = 0;

/**
 * @type {import('./type').HandleCacheSubscriberMap}
 */
const subscriberMap = new Map();

/**
 * Add new item to cache.
 *
 * @param {Object | HTMLElement} el
 * @param {(arg0: any, arg1: Object | HTMLElement) => void} fn
 * @returns {{ id: string; unsubscribe: () => void }}
 */
const add = (el = {}, fn = () => {}) => {
    const id = getUnivoqueId();

    subscriberMap.set(id, {
        el,
        fn,
        data: new Map(),
        freeze: {
            active: false,
            atFrame: 0,
        },
    });

    return {
        id,
        unsubscribe: () => {
            if (subscriberMap.has(id)) {
                /*
                 * When we remove some items before fired we have to update the
                 * cachecounter so handleFrame can stop
                 */
                const item = subscriberMap.get(id);
                if (!item) return;

                const frameToSubstract = item.data.size;
                subscriberMap.delete(id);
                if (!frameToSubstract) return;

                cacheCoutner = cacheCoutner - frameToSubstract;
            }
        },
    };
};

/**
 * Add new data on existing id in a specific frame.
 *
 * @param {Object} obj
 * @param {string} obj.id
 * @param {Record<string, number>} obj.callBackObject
 * @param {number} obj.frame
 * @returns {void}
 */
const update = ({ id, callBackObject, frame }) => {
    if (!subscriberMap.has(id)) return;

    const { currentFrame } = eventStore.get();
    const item = subscriberMap.get(id);

    if (!item?.data) return;
    const { data } = item;

    /**
     * If frame is overridden the counter is not synchronized with real number of callback. So skip.
     */
    if (data.has(frame + currentFrame)) return;

    data.set(frame + currentFrame, callBackObject);
    cacheCoutner++;
};

/**
 * Remove item from cache.
 *
 * @memberof module:handleCache
 * @param {string} id
 * @returns {void}
 */
const remove = (id) => {
    if (subscriberMap.has(id)) subscriberMap.delete(id);
};

/**
 * Freeze item.
 *
 * @memberof module:handleCache
 * @param {string} id
 * @returns {void}
 */
const freeze = (id) => {
    const item = subscriberMap.get(id);
    if (!item) return;

    if (item.freeze.active) return;

    const { currentFrame } = eventStore.get();

    item.freeze = {
        active: true,
        atFrame: currentFrame,
    };
};

/**
 * UnFreeze item.
 *
 * @memberof module:handleCache
 * @param {object} params
 * @param {string} params.id
 * @param {boolean} [params.update]
 * @returns {void}
 */
const unFreeze = ({ id, update = true }) => {
    const item = subscriberMap.get(id);
    if (!item) return;

    if (!item.freeze.active) return;

    if (!update) {
        item.freeze = {
            active: false,
            atFrame: 0,
        };
        return;
    }

    const { currentFrame } = eventStore.get();
    const { atFrame } = item.freeze;

    /**
     * Temp map. Store new item updated here.
     */
    const newEntries = [];

    /**
     * Get item with updated frame, and clear old freezed.
     */
    for (const [frame, value] of item.data) {
        const delta = frame + currentFrame - atFrame;
        item.data.delete(frame);

        newEntries.push({ frame: delta, value });
    }

    /**
     * Add item updated.
     */
    newEntries.forEach(({ frame, value }) => {
        item.data.set(frame, value);
    });

    /**
     * Clear temp map
     */
    newEntries.length = 0;

    item.freeze = {
        active: false,
        atFrame: 0,
    };
};

/**
 * Reset item data
 *
 * @param {string} id
 * @returns {void}
 */
const clean = (id) => {
    const el = subscriberMap.get(id);
    if (!el) return;

    /*
     * When we remove some items before fired we have to update the
     * cachecounter so handleFrame can stop
     */
    const frameToSubstract = el.data.size;
    cacheCoutner = cacheCoutner - frameToSubstract;
    el.data.clear();
};

/**
 * Get item object
 *
 * @memberof module:handleCache
 * @param {string} id
 * @returns {import('./type').HandleCacheSubscriberValue | {}}
 */
const get = (id) => {
    return subscriberMap.get(id) ?? {};
};

/**
 * Render obj on specific frame and delete rendered object.
 *
 * @param {number} frameCounter - Frame to render.
 * @returns {void}
 */
const fire = (frameCounter) => {
    for (const value of subscriberMap.values()) {
        const { data, fn, el, freeze } = value;
        if (freeze.active) return;

        const callBackObject = data.get(frameCounter);

        if (callBackObject) {
            fn(callBackObject, el);

            data.delete(frameCounter);
            cacheCoutner--;
        }
    }
};

/**
 * Render immediately obj using existing id/function
 *
 * @param {Object} obj
 * @param {string} obj.id
 * @param {Record<string, number>} obj.obj
 * @returns {void}
 */
const fireObject = ({ id, obj = {} }) => {
    if (!subscriberMap.has(id)) return;

    const item = subscriberMap.get(id);
    if (!item) return;

    const { el, fn, freeze } = item;
    if (freeze.active) return;

    fn(obj, el);
};

/**
 * Get current number of frame to render.
 *
 * @returns {number}
 */
const getCacheCounter = () => cacheCoutner;

/**
 * When frameCounter become too big reset and recalculate all the frame values.
 *
 * @param {number} maxFramecounter
 */
const updateFrameId = (maxFramecounter) => {
    for (const [key, value] of subscriberMap) {
        const { data, fn, el, freeze } = value;

        const newMap = new Map();
        for (const [frame, object] of data) {
            newMap.set(frame - maxFramecounter, object);
            data.delete(frame);
        }

        subscriberMap.set(key, { data: newMap, fn, el, freeze });
    }
};

/**
 * @module handleCache
 */
export const handleCache = (() => {
    return {
        add,
        get,
        update,
        remove,
        clean,
        fire,
        fireObject,
        getCacheCounter,
        updateFrameId,
        freeze,
        unFreeze,
    };
})();
