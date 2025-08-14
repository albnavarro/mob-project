/**
 * From data object return an object filtered by props in activeData
 *
 * @param {object} params
 * @param {Record<string, number | (() => number)>} params.data
 * @param {Record<string, number | (() => number)>} params.filterBy
 */
export const filterActiveProps = ({ data, filterBy }) => {
    return Object.entries(data)
        .map((item) => {
            const [prop, val] = item;
            const valueIsValid = prop in filterBy;
            return { data: { [prop]: val }, active: valueIsValid };
        })
        .filter(({ active }) => active)
        .map(({ data }) => data)
        .reduce((p, c) => {
            return { ...p, ...c };
        }, {});
};
