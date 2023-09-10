// @ts-check

/**
 * @type {String}
 */
export const ANIMATION_STOP_REJECT = 'animationStop';

/**
 * @returns void
 */
export const catchAnimationReject = () => {
    window.addEventListener('unhandledrejection', (e) => {
        if (e.reason === ANIMATION_STOP_REJECT) e.preventDefault();
    });
};
