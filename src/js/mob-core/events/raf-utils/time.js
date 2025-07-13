// Get right time if server side or client side
export const getTime = () => {
    return typeof globalThis === 'undefined'
        ? Date.now()
        : globalThis.performance.now();
};

export const defaultTimestep = (1 / 60) * 1000;
