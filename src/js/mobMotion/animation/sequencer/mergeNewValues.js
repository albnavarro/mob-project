// @ts-check

/**
 * @param {Object} param
 * @param {any[]} param.data
 * @param {import("./type").SequencerValue[]} param.values
 * @return {import("./type").SequencerValue[]}
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
