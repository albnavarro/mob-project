import { checkType } from '../../store/storeType';

export const shouldInizializzeStagger = (each, firstRun, arr1, arr2) => {
    if (!checkType(Number, each)) {
        console.warn('stagger error, each must be a Number');
    }

    return each > 0 && firstRun && (arr1.length || arr2.length);
};
