export const getValueObj = (arr, key) => {
    return arr
        .map((item) => {
            return {
                [item.prop]: parseFloat(item[key]),
            };
        })
        .reduce((p, c) => {
            return { ...p, ...c };
        }, {});
};

export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};
