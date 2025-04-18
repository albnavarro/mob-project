// @ts-check

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
        const { data, fn, el } = value;
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

    const { el, fn } = item;
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
        const { data, fn, el } = value;

        const newMap = new Map();
        for (const [frame, object] of data) {
            newMap.set(frame - maxFramecounter, object);
            data.delete(frame);
        }

        subscriberMap.set(key, { data: newMap, fn, el });
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
    };
})();
