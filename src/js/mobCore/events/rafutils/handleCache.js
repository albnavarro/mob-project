// @ts-check

import { getUnivoqueId } from '../../utils';
import { eventStore } from '../eventStore';

/**
 * @type {number}
 *
 * @description
 * Increment and decrement when we add or fire a item.
 * hadleFrame use that to check if the requestAnimationFrame have to go on.
 * Indeicate fi there is frame to render.
 */
let cacheCoutner = 0;

/**
 * @type {Map.<string, { el: (Object|HTMLElement), fn: Function, data: Map.<number, Object> }>}
 */
const subscriberMap = new Map();

/**
 * @param {Object|HTMLElement} el
 * @param {Function} fn
 * @returns {{id:string,unsubscribe:function():void}}
 *
 * @description
 * Add new item to cache.
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
 * @param {Object} obj
 * @param {string} obj.id
 * @param {Object} obj.callBackObject
 * @param {number} obj.frame
 * @returns void
 *
 * @description
 * Add new data on existing id in a specific frame.
 */
const update = ({ id, callBackObject, frame }) => {
    if (!subscriberMap.has(id)) return;

    const { currentFrame } = eventStore.get();
    const item = subscriberMap.get(id);

    if (!item?.data) return;
    const { data } = item;

    /**
     * If frame is overridden the counter is not synchronized with real
     * number of callback.
     * So skip.
     */
    if (data.has(frame + currentFrame)) return;

    data.set(frame + currentFrame, callBackObject);
    cacheCoutner++;
};

/**
 * @memberof module:handleCache
 * @param {string} id
 * @returns void
 *
 * @description
 * Remove item from cache.
 */
const remove = (id) => {
    if (subscriberMap.has(id)) subscriberMap.delete(id);
};

/**
 * @param {string} id
 * @returns void
 *
 * @description
 * Reset item data
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
 * @memberof module:handleCache
 * @param {string} id
 * @returns {Object.<number, { el: (Object|HTMLElement), fn: Function, data: Object.<number, Object> }>}
 *
 * @description
 * Get item object
 */
const get = (id) => {
    return subscriberMap.get(id) ?? {};
};

/**
 * @param {number} frameCounter - frame to render.
 * @returns void
 *
 * @description
 * Render obj on specific frame and delete rendered object.
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
 * @param {Object} obj
 * @param {string} obj.id
 * @param {Object} obj.obj
 * @returns void
 *
 * @description
 * Render immediately obj using existing id/function
 */
const fireObject = ({ id, obj = {} }) => {
    if (!subscriberMap.has(id)) return;

    const item = subscriberMap.get(id);
    if (!item) return;

    const { el, fn } = item;
    fn(obj, el);
};

/**
 * @returns {number}
 *
 * @description
 * Get current number of frame to render.
 */
const getCacheCounter = () => cacheCoutner;

/**
 * @param {number} maxFramecounter
 *
 * @description
 * When frameCounter become too big reset and recalculate all the frame values.
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
 * @description
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
