// @ts-check

/**
 * @param {Object} param
 * @param {Array} param.data
 * @param {import("./type").sequencerValue[]} param.values
 * @return {import("./type").sequencerValue[]}
 */
export const mergeNewValues = ({ data, values }) => {
    return values.map((item) => {
        const itemToMerge = data.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge
            ? { ...item, ...itemToMerge, active: true }
            : {
                  prop: item.prop,
                  active: false,
              };
    });
};
