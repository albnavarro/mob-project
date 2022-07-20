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
        subscriber.set(id, { ...obj, ...newAction });
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

                // E' necessario salvare _value per poi cacellare il frame ??
                let _value = value;
                delete _value.action[frame];
                // E' necessario firar eils set ???
                subscriber.set(key, _value);
            }
        }
    };

    return {
        add,
        update,
        remove,
        fire,
    };
};

// handleFrame
handleCache.fire(currentFrame);
