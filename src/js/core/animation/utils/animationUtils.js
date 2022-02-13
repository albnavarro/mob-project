export const getValueObj = (arr, key) => {
    return arr
        .map((item) => ({ [item.prop]: parseFloat(item[key]) }))
        .reduce((p, c) => ({ ...p, ...c }), {});
};

export const mergeArray = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge ? { ...item, ...itemToMerge } : item;
    });
};

export const mergeArrayTween = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge
            ? { ...item, ...itemToMerge, ...{ shouldUpdate: true } }
            : { ...item, ...{ shouldUpdate: false } };
    });
};

export const getTime = () => {
    return typeof window !== 'undefined'
        ? window.performance.now()
        : Date.now();
};

export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};
