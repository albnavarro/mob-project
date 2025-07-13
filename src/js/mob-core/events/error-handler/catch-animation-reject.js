/**
 * @type {string}
 */
export const ANIMATION_STOP_REJECT = 'animationStop';

/**
 * @returns {void}
 */
export const catchAnimationReject = () => {
    globalThis.addEventListener('unhandledrejection', (e) => {
        if (e.reason === ANIMATION_STOP_REJECT) e.preventDefault();
    });
};
