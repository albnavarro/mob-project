export const parallaxUtils = {
    normalizeVelocity(value) {
        if (value < 1) {
            return 1;
        } else if (value >= 10) {
            return 9.9;
        } else {
            return (10 - value) * 10;
        }
    },

    normalizeRange(value) {
        if (value < 0) {
            return 9.9;
        } else if (value >= 10) {
            return 0.1;
        } else {
            return 10 - value;
        }
    },

    isInViewport({ offset, height, gap, wScrollTop, wHeight }) {
        return (
            offset + height > wScrollTop - gap &&
            offset < wScrollTop + (wHeight + gap)
        );
    },

    getValueOnSwitch({ switchPropierties, isReverse, value, prop }) {
        switch (switchPropierties) {
            case prop.inStop:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? 0
                    : value;

            case prop.inBack:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? -value
                    : value;

            case prop.outStop:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? 0
                    : value;

            case prop.outBack:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? -value
                    : value;

            default:
                return value;
        }
    },

    getRetReverseValue(propierties, val, opacity) {
        switch (propierties) {
            case opacity:
                return 1 - val;

            default:
                return -val;
        }
    },

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
};
