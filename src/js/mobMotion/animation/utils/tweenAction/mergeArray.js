/**
 * @type {import("./type").MergeTweenData}
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
 * @param {import("./type").AllActionType[]} newData
 * @param {import("../../tween/type").TimeTweenStoreData[]} data
 * @returns {import("../../tween/type").TimeTweenStoreData[]}
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
