import { MobMotionCore, MobTween } from '../..';
import { MobCore } from '../../../mob-core';
import { clamp } from '../../core';

/** @type {number} */
let windowInnerheight = window.innerHeight;

/** @type {number} */
let windowOffsetheight = document.body.offsetHeight;

let isActive = false;

let usePrevent = true;

/** @type {number} */
let lastScrollValue = window.scrollY;

/** @type {boolean} */
let useNativeScroll = true;

/** @type {boolean} */
let isFreezed = false;

/** @type{() => void} */
let destroy = () => {};

/** @type{() => void} */
let stop = () => {};

/** @type{() => void} */
let update = () => {};

/** @type {HTMLElement | undefined} */
let rootElementToObserve;

const removeWhellingClass = () => {
    document.body.classList.remove('is-whelling');
};

const addWhellingClass = () => {
    document.body.classList.add('is-whelling');
};

/**
 * Necessary.
 *
 * Enable the possibility to use preventDefault to block scroll page on wheel event. ( we scroll page manually ).
 */
MobMotionCore.setDefault({
    usePassive: false,
});

/** @type {import('./type').MobPageScroller} */
const MobPageScroller = ({ velocity, rootElement }) => {
    let lerp = MobTween.createLerp({
        data: { scrollValue: window.scrollY },
        precision: 1,
        velocity: 0.1,
    });

    rootElementToObserve = rootElement;

    const unsubscribe = lerp.subscribe(({ scrollValue }) => {
        if (isFreezed) return;

        window.scrollTo({
            top: Math.round(scrollValue),
            left: 0,
            behavior: 'instant',
        });
    });

    lerp.onComplete(() => {
        lastScrollValue = window.scrollY;
    });

    /**
     * Main handler.
     */
    const unsubscribeMouseWheel = MobCore.useMouseWheel((event) => {
        if (isFreezed) return;

        event.preventDefault();
        useNativeScroll = false;
        addWhellingClass();

        /**
         * Normalize spinValue between -1 && 1.
         */
        const spinY = clamp(event.spinY ?? 0, -1, 1);

        const currentValue = MobMotionCore.clamp(
            spinY * velocity + lastScrollValue,
            0,
            windowOffsetheight - windowInnerheight
        );

        lastScrollValue = currentValue;
        lerp.goTo({ scrollValue: currentValue }).catch(() => {});
    });

    /**
     * Disable scroll on well event. we manage scroll manually with scrollTo() API.
     */
    const unsubscribeWhellPrevent = MobCore.useMouseWheel(
        ({ preventDefault }) => {
            if (usePrevent) preventDefault();
        }
    );

    /**
     * Remove wheeling class on end wheel with debounce.
     */
    const unsubscribeDebounceWheel = MobCore.useMouseWheel(
        MobCore.debounce(() => {
            removeWhellingClass();
        }, 500)
    );

    /**
     * Update lerp on scrollEnd eg. when search something in page
     */
    const unsubsribeScrollEnd = MobCore.useScrollEnd(() => {
        const value = window.scrollY;
        lastScrollValue = value;
        lerp.setImmediate({ scrollValue: value });
    });

    /**
     * Update lerp value on native scroll event.
     */
    const unsubscribeScroll = MobCore.useScroll(() => {
        if (!useNativeScroll) {
            return;
        }

        const value = window.scrollY;
        lastScrollValue = value;
        lerp.setImmediate({ scrollValue: value });
    });

    /**
     * Stop lerp on pointerDown. Stop lerp even is touch or mouse click.
     */
    const unsubscribePointerDown = MobCore.usePointerDown(() => {
        if (isFreezed) return;
        removeWhellingClass();

        lerp.stop();
        lastScrollValue = window.scrollY;
        useNativeScroll = true;
    });

    /**
     * Update lerp value on change screen dimension
     */
    const resizeObserver = new ResizeObserver(() => {
        lerp.stop();
        lerp.setImmediate({ scrollValue: window.scrollY });
        lastScrollValue = window.scrollY;
        windowInnerheight = window.innerHeight;
        windowOffsetheight = document.body.offsetHeight;
    });

    resizeObserver.observe(rootElement);

    return {
        destroy: () => {
            isActive = false;
            lastScrollValue = 0;
            useNativeScroll = true;
            isFreezed = false;

            // Disconnect resizeObserver.
            if (rootElementToObserve) {
                resizeObserver.unobserve(rootElementToObserve);
                resizeObserver.disconnect();
            }

            lerp?.stop();
            lerp?.destroy();

            // @ts-ignore
            lerp = null;

            // @ts-ignore
            rootElementToObserve = null;
            unsubscribe();
            unsubscribeScroll();
            unsubsribeScrollEnd();
            unsubscribeMouseWheel();
            unsubscribePointerDown();
            unsubscribeDebounceWheel();
            unsubscribeWhellPrevent();
            destroy = () => {};
            stop = () => {};
            update = () => {};
        },
        stop: () => {
            lerp.stop();
            lastScrollValue = window.scrollY;
        },
        update: () => {
            lerp.setImmediate({ scrollValue: window.scrollY });
        },
    };
};

/** @type{(arg0?: {velocity?: number, rootElement?: HTMLElement} ) => void} */
export const InitMobPageScroll = ({
    velocity = 100,
    rootElement = document.createElement('div'),
} = {}) => {
    if (isActive) return;

    lastScrollValue = window.scrollY;
    isActive = true;
    isFreezed = false;
    windowInnerheight = window.innerHeight;
    windowOffsetheight = document.body.offsetHeight;
    usePrevent = true;
    useNativeScroll = false;

    ({ destroy, stop, update } = MobPageScroller({
        velocity,
        rootElement,
    }));
};

/** @type{() => void} */
export const FreezeMobPageScroll = () => {
    if (!isActive || isFreezed) return;

    stop();
    isFreezed = true;
};

/** @type{() => void} */
export const UnFreezeMobPageScroll = () => {
    if (!isActive || !isFreezed) return;

    isFreezed = false;
};

/** @type{() => void} */
export const UnFreezeAndUPdateMobPageScroll = () => {
    if (!isActive || !isFreezed) return;

    update();
    lastScrollValue = window.scrollY;
    isFreezed = false;
};

/** @type{() => void} */
export const UpdateMobPageScroll = () => {
    if (!isActive) return;

    update();
};

/** @type{() => void} */
export const DestroyMobPageScroll = () => {
    destroy();
};

/** @type{() => void} */
export const enebalePreventScroll = () => {
    usePrevent = true;
};

/** @type{() => void} */
export const disablePreventScroll = () => {
    usePrevent = false;
};

/** @type{() => boolean} */
export const getActiveStateScroll = () => {
    return isActive;
};
