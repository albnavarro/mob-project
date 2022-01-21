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
