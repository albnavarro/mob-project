// USARE new Map anche per addIndex

const unsubscribers = items.map((item, i) => {
    const { id, unsubscribe } = handleCache.add(item, ({ rotate }, el) => {
        el.transform = `rotate(${rotate}px)`;
    });

    // la propieta cb e uguale a callback per usare setStagger
    // Poi vedere come uniformare
    myTween.subscribeCache({ cb: id });
    return unsubscribe;
});

// defaultCallback.js
// Se callbackCache.length > callback.lenght passo callbackCache a setStagger
// O uso callbackCache o uso callback
// la propieta cb coincide
callbackCache.forEach(({ cb, index, frame }) => {
    // Rimuovere index anche da callback normale non serve
    handleCache.update({ id: cb, cbObject, frame });
});

// handleCache
const handleCache = () => {
    let id = 0;
    let cacheCoutner = 0;
    const subscriber = new Map();

    // Add item and callback
    const add = (el, fn) => {
        subscriber.set(id, {
            el,
            fn,
            // fn: ({ rotate }, el) => {
            //     el.transform = `rotate(${rotate}px)`;
            // },
            action: {
                // 1: {rotate:0},
                // 5: {rotate:1},
                // ....
            },
        });

        const prevId = id;
        id++;

        return () => subscriber.delete(prevId);
    };

    // Update item from id add to action dframe and relative cbObject
    const update = ({ id, cbObject, frame }) => {
        if (!subscriber.has(id)) return;

        const currentFrame = handleFrame.getCurrentFrame();
        const obj = subscriber.get(id);
        const newAction = {
            ...obj.action,
            ...{ [frame + currentFrame]: cbObject },
        };
        subscriber.delete(id);
        subscriber.set(id, { ...obj, ...newAction });

        // A ognicbObject aggiunto alzo di 1
        cacheCoutner++;
    };

    // Remove item from id
    const remove = (id) => {
        subscriber.delete(id);
    };

    // Fire every item if have frame now and then remove item form action
    // la funzione viene richiamata da handleFrame
    const fire = (currentFrame) => {
        // or forEach is possible
        for (const [key, value] of subscriber) {
            const cbObject = value.action[currentFrame];
            if (frameItem) {
                value.fn(cbObject, value.el);

                delete value.action[frame];

                subscriber.delete(key);
                subscriber.set(key, value);
                matches = true;

                // A ogni cbObject tolto abbasso di 1
                cacheCoutner--;
            }
        }
    };

    // Condizione da aggiungere per fare andare avanti la RF
    const getCacheCounter = () => cacheCoutner;

    return {
        add,
        update,
        remove,
        fire,
        getCacheCounter,
    };
};

// handleFrame
handleCache.fire(currentFrame);
