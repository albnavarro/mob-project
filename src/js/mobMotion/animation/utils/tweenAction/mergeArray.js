/**
 * @param {Record<'prop', any>[]} newData
 * @param {Record<'prop', any>[]} data
 * @returns {any[]}
 *
 * @description
 * Merge animation store of specific lerp/spring .. with new data from goTo etc..
 */
export const mergeArray = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge ? { ...item, ...itemToMerge } : item;
    });
};

/**
 * @param {import("../../tween/type").tweenStoreData[]} newData
 * @param {import("../../tween/type").tweenStoreData[]} data
 * @returns {import("../../tween/type").tweenStoreData[]}
 *
 * @description
 * Merge animation store of specific tween .. with new data from goTo etc..
 */
export const mergeArrayTween = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge
            ? { ...item, ...itemToMerge, shouldUpdate: true }
            : { ...item, shouldUpdate: false };
    });
};
