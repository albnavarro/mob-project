export const compareKeysWarning = (label, fromObj, toObj) => {
    console.warn(
        `${label}: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
            toObj
        )} is not equal`
    );
};

export const staggerIsOutOfRangeWarning = (max) => {
    console.warn(
        `stagger col of grid is out of range, it must be less than ${max} ( staggers length )`
    );
};

export const dataTweenValueIsNotValidWarning = (label) => {
    console.warn(
        `tween | sequencer: ${label} is not valid value, must be a number or a function`
    );
};

export const sequencerRangeStartWarning = (val) => {
    console.warn(
        `sequencer, start option: ${val} value is not valid, must be a Number`
    );
};

export const sequencerRangeEndWarning = (val) => {
    console.warn(
        `sequencer, end option: ${val} value is not valid, must be a Number`
    );
};

export const relativePropInsideTimelineWarning = () => {
    console.warn('relative prop is not allowed inside a timeline');
};
