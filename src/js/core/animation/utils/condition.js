import { checkType } from '../../store/storeType';
import { staggerEachWarning } from './warning';

export const shouldInizializzeStagger = (each, firstRun, arr1, arr2) => {
    if (!checkType(Number, each)) {
        staggerEachWarning();
    }

    return each > 0 && firstRun && (arr1.length || arr2.length);
};
