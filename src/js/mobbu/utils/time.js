// Get right time if server side or client side
export const getTime = () => {
    return typeof window !== 'undefined'
        ? window.performance.now()
        : Date.now();
};

export const defaultTimestep = (1 / 60) * 1000;
