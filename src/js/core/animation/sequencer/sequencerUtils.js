import { clamp } from '../utils/animationUtils.js';

export const sequencerDelay = ({ factor, duration, itemsLength, index }) => {
    const realDelay = clamp(duration / factor, 1, duration);
    const unit = Math.abs(duration / itemsLength / realDelay);
    const itemDelay = unit * index;
    const start = itemDelay;
    const end = duration;

    return { start, end };
};

export const sequencerEqual = ({ duration, itemsLength, index }) => {
    const stepDuration = duration / itemsLength;
    const start = index * stepDuration;
    const end = start + stepDuration;

    return { start, end };
};
