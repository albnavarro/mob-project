export const goTo = (obj) => {
    return Object.keys(obj).map((item) => {
        return {
            prop: item,
            toValue: obj[item],
            settled: false,
        };
    });
};

export const goFrom = (obj) => {
    return Object.keys(obj).map((item) => {
        return {
            prop: item,
            fromValue: obj[item],
            currentValue: obj[item],
            settled: false,
        };
    });
};

export const goFromTo = (fromObj, toObj) => {
    return Object.keys(fromObj).map((item) => {
        return {
            prop: item,
            fromValue: fromObj[item],
            currentValue: fromObj[item],
            toValue: toObj[item],
            settled: false,
        };
    });
};

export const set = (obj) => {
    return Object.keys(obj).map((item) => {
        return {
            prop: item,
            fromValue: obj[item],
            currentValue: obj[item],
            toValue: obj[item],
            settled: false,
        };
    });
};
