export const parallaxUtils = {
    isInViewport({ offset, height, gap, wScrollTop, wHeight }) {
        return (
            offset + height > wScrollTop - gap &&
            offset < wScrollTop + (wHeight + gap)
        );
    },

    processFixedLimit(value, stringValue, height, width) {
        const str = String(stringValue);

        // plus
        if (str.includes('+h/')) {
            return value + height / 2;
        }

        if (str.includes('+h')) {
            return value + height;
        }

        if (str.includes('+w/')) {
            return value + width / 2;
        }

        if (str.includes('+w')) {
            return value + width;
        }

        // minus
        if (str.includes('-h/')) {
            return value - height / 2;
        }

        if (str.includes('-h')) {
            return value - height;
        }

        if (str.includes('-w/')) {
            return value - width / 2;
        }

        if (str.includes('-w')) {
            return value - width;
        }

        return value;
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
