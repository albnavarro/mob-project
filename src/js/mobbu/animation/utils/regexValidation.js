const escapeRegExp = (text) => {
    return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : '';
};

export const checkIfIsOnlyNumberPositiveNegative = (pattern) => {
    return /^[-+]?[0-9]\d*(\.\d+)?$/.test(pattern);
};

export const checkIfIsOnlyNumber = (pattern) => {
    return /^\d+\.\d+$|^\d+$/.test(pattern);
};
/**
 * Compare two string exact match case insensitive
 */
export const exactMatchInsensitive = (string, pattern) => {
    const regex = new RegExp(`^${escapeRegExp(pattern)}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 *
 */
export const exactMatchInsesitiveNumberProp = (string, pattern) => {
    const regex = new RegExp(`[0-9]${pattern}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * Compare an array of String with a pattern exact match case insensitive
 */
export const exactMatchInsesitiveNumberPropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`[0-9]${unitMisure}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};

export const exactMatchInsesitivePropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`^${escapeRegExp(unitMisure)}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};
