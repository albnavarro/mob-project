import { frameStore } from './frameStore.js';

export const handleCache = (() => {
    let id = 0;
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
            unsubscribe: () => delete subscriber[prevId],
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
        fire,
        fireObject,
        getCacheCounter,
        updateFrameId,
    };
})();
