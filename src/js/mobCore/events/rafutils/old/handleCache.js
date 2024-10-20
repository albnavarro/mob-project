// @ts-check

import { eventStore } from '../../eventStore';

/**
 * @type {number}
 */
let id = 0;

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
 * @type {Object.<number, { el: (Object|HTMLElement), fn: function, data: Object.<number, Object> }>}
 */
const subscriber = {};

/**
 * @param {Object|HTMLElement} el
 * @param {Function} fn
 * @returns {{id:number,unsubscribe:function():void}}
 *
 * @description
 * Add new item to cache.
 */
const add = (el = {}, fn = () => {}) => {
    subscriber[id] = {
        el,
        fn,
        data: {},
    };

    /**
     * @type {number}
     */
    const prevId = id;
    id++;

    return {
        id: prevId,
        unsubscribe: () => {
            if (subscriber?.[prevId]) {
                /*
                 * When we remove some items before fired we have to update the
                 * cachecounter so handleFrame can stop
                 */
                const frameToSubstract = Object.keys(
                    subscriber[prevId].data
                ).length;
                cacheCoutner = cacheCoutner - frameToSubstract;
                delete subscriber[prevId];
            }
        },
    };
};

/**
 * @param {Object} obj
 * @param {number} obj.id
 * @param {{[key:string]:number}} obj.callBackObject
 * @param {number} obj.frame
 * @returns void
 *
 * @description
 * Add new data on existing id in a specific frame.
 */
const update = ({ id, callBackObject, frame }) => {
    if (!subscriber[id]) return;

    const { currentFrame } = eventStore.get();
    const { data } = subscriber[id];
    if (data[frame + currentFrame]) return;
    data[frame + currentFrame] = callBackObject;
    cacheCoutner++;
};

/**
 * @memberof module:handleCache
 * @param {number} id
 * @returns void
 *
 * @description
 * Remove item from cache.
 */
const remove = (id) => {
    if (id in subscriber) delete subscriber[id];
};

/**
 * @param {number} id
 * @returns void
 *
 * @description
 * Reset item data
 */
const clean = (id) => {
    const el = subscriber?.[id];
    if (!el) return;

    /*
     * When we remove some items before fired we have to update the
     * cachecounter so handleFrame can stop
     */
    const frameToSubstract = Object.keys(el.data).length;
    cacheCoutner = cacheCoutner - frameToSubstract;
    el.data = {};
};

/**
 * @memberof module:handleCache
 * @param {number} id
 * @returns {Object.<number, { el: (Object|HTMLElement), fn: Function, data: Object.<number, Object> }>}
 *
 * @description
 * Get item object
 */
const get = (id) => {
    return subscriber?.[id] ?? {};
};

/**
 * @param {number} frameCounter - frame to render.
 * @param {boolean} shouldRender - should render.
 * @returns void
 *
 * @description
 * Render obj on specific frame and delete rendered object.
 */
const fire = (frameCounter, shouldRender) => {
    Object.values(subscriber).forEach(({ data, fn, el }) => {
        const callBackObject = data?.[frameCounter];

        if (callBackObject) {
            if (shouldRender) {
                fn(callBackObject, el);
            }

            data[frameCounter] = null;
            delete data[frameCounter];
            cacheCoutner--;
        }
    });
};

/**
 * @param {Object} obj
 * @param {number} obj.id
 * @param {{[key:string]: number}} obj.obj
 * @returns void
 *
 * @description
 * Render immediately obj using existing id/function
 */
const fireObject = ({ id, obj = {} }) => {
    if (!subscriber?.[id]) return;

    const { el, fn } = subscriber[id];
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
    Object.values(subscriber).forEach(({ data }) => {
        Object.keys(data).forEach((key) => {
            delete Object.assign(data, {
                [`${Number.parseInt(key) - maxFramecounter}`]: data[key],
            })[key];
        });
    });
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
