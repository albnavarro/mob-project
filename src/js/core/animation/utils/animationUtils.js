import { storeType } from '../../store/storeType.js';

export const getUnivoqueId = () => {
    return `_${Math.random().toString(36).substring(2, 9)}`;
};

export const getValueObj = (arr, key) => {
    return arr
        .map((item) => ({ [item.prop]: parseFloat(item[key]) }))
        .reduce((p, c) => ({ ...p, ...c }), {});
};

export const getValueObjToNative = (arr) => {
    return arr
        .map((item) => {
            if (item.toIsFn) return { [item.prop]: item.toFn };
            else return { [item.prop]: parseFloat(item.toValue) };
        })
        .reduce((p, c) => ({ ...p, ...c }), {});
};

export const getValueObjFromNative = (arr) => {
    return arr
        .map((item) => {
            if (item.fromIsFn) return { [item.prop]: item.fromFn };
            else return { [item.prop]: parseFloat(item.fromValue) };
        })
        .reduce((p, c) => ({ ...p, ...c }), {});
};

export const getRoundedValue = (x) => {
    if (storeType.isNumber(x)) {
        return Math.round(x * 10000) / 10000 || 0;
    } else {
        if (Math.abs(x) < 1.0) {
            let e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + new Array(e).join('0') + x.toString().substring(2);
            }
        } else {
            let e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }

        return parseFloat(parseFloat(x).toFixed(4));
    }
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

export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

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
