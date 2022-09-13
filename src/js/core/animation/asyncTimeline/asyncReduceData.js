/*
 * From data object return an object filtered by props in activeData
 */
export const asyncReduceData = (data, activeData) => {
    return Object.entries(data)
        .map((item) => {
            const [prop, val] = item;
            const valueIsValid = prop in activeData;
            return { data: { [prop]: val }, active: valueIsValid };
        })
        .filter(({ active }) => active)
        .map(({ data }) => data)
        .reduce((p, c) => {
            return { ...p, ...c };
        }, {});
};
