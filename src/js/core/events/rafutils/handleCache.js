import { frameStore } from './frameStore.js';

/**
 * @private
 */
export const handleCache = (() => {
    let id = 0;

    /**
     * Incremoene and decrement when we add or fire a item
     * hadleFrme use that to check if the requestAnimationFrame have to go on
     */
    let cacheCoutner = 0;
    const subscriber = {};

    const add = (el, fn) => {
        subscriber[id] = {
            el,
            fn,
            data: {},
        };

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

    const update = ({ id, cbObject, frame }) => {
        if (!subscriber[id]) return;

        const { currentFrame } = frameStore.get();
        const { data } = subscriber[id];
        if (data[frame + currentFrame]) return;
        data[frame + currentFrame] = cbObject;
        cacheCoutner++;
    };

    const remove = (id) => {
        if (id in subscriber) delete subscriber[id];
    };

    const clean = (id) => {
        const el = subscriber[id];
        if (!el) return;

        /*
         * When we remove some items before fired we have to update the
         * cachecounter so handleFrame can stop
         */
        const frameToSubstract = Object.keys(el.data).length;
        cacheCoutner = cacheCoutner - frameToSubstract;
        el.data = {};
    };

    const get = (id) => {
        return subscriber?.[id];
    };

    const fire = (frameCounter, shouldRender) => {
        Object.values(subscriber).forEach(({ data, fn, el }) => {
            const cbObject = data?.[frameCounter];

            if (cbObject) {
                if (shouldRender) {
                    fn(cbObject, el);
                }
                data[frameCounter] = null;
                delete data[frameCounter];
                cacheCoutner--;
            }
        });
    };

    const fireObject = ({ id, obj }) => {
        if (!subscriber[id]) return;

        const { el, fn } = subscriber[id];
        fn(obj, el);
    };

    const getCacheCounter = () => cacheCoutner;

    const updateFrameId = (maxFramecounter) => {
        Object.values(subscriber).forEach(({ data }) => {
            Object.keys(data).forEach((key) => {
                delete Object.assign(data, {
                    [`${parseInt(key) - maxFramecounter}`]: data[key],
                })[key];
            });
        });
    };

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
