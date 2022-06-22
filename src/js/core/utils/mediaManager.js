import { handleSetUp } from '../setup.js';

export const mq = (() => {
    const max = (breakpoint) => {
        return window.innerWidth < handleSetUp.get('mq')[breakpoint];
    };
    const min = (breakpoint) => {
        return window.innerWidth >= handleSetUp.get('mq')[breakpoint];
    };
    const getBreackpoint = (breakpoint) => {
        return handleSetUp.get('mq')[breakpoint];
    };

    return { max, min, getBreackpoint };
})();
