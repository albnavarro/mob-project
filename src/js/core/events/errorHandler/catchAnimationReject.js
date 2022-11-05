export const ANIMATION_STOP_REJECT = 'animationStop';

export const catchAnimationReject = () => {
    window.addEventListener('unhandledrejection', (e) => {
        if (e.reason === ANIMATION_STOP_REJECT) e.preventDefault();
    });
};
