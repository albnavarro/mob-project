export const shouldInizializzeStagger = (each, firstRun, arr1, arr2) => {
    return each > 0 && firstRun && (arr1.length || arr2.length);
};
