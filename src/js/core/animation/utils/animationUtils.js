export const getUnivoqueId = () => {
    return `_${Math.random().toString(36).substr(2, 9)}`;
};

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

export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

/**
 * this.compareKeys - Compare two Object
 * Check if has the same keys
 *
 * @param  {Object} a fromObj Object
 * @param  {Object} b toObj Object
 * @return {bollean} has thew same keys
 */
export const compareKeys = (a, b) => {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    return JSON.stringify(aKeys) === JSON.stringify(bKeys);
};

export const sliceIntoChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
};

export const arrayColumn = (arr, n) => arr.map((x) => x[n]);
