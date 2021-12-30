export function parallaxEmitter({
    prevValue,
    value,
    maxVal,
    onEnter,
    onEnterBack,
    onLeave,
    onLeaveBack,
}) {
    if (value > maxVal && prevValue < maxVal) {
        if (maxVal > 0) {
            if (onLeave) onLeave();
        } else {
            if (onLeaveBack) onLeaveBack();
        }
    }

    if (value < maxVal && prevValue > maxVal) {
        if (maxVal > 0) {
            if (onLeaveBack) onLeaveBack();
        } else {
            if (onLeave) onLeave();
        }
    }

    if (value > 0 && value < maxVal && prevValue < 0 && maxVal > 0) {
        if (onEnter) onEnter();
    }

    if (value > 0 && prevValue < 0 && maxVal < 0) {
        if (onEnterBack) onEnterBack();
    }

    if (value < 0 && prevValue > 0) {
        if (maxVal > 0) {
            if (onEnterBack) onEnterBack();
        } else {
            if (onEnter) onEnter();
        }
    }
}
