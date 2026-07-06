import { MobMotionCore, MobTween } from '../..';
import { MobCore } from '../../../mob-core';

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

/**
 * UTILS:
 *
 * - Add is-whelling class to body when lerp is in movement.
 */
const removeWhellingClass = () => {
    document.body.classList.remove('is-whelling');
};

/**
 * UTILS:
 *
 * - Remove is-whelling class to body when lerp stop.
 */
const addWhellingClass = () => {
    document.body.classList.add('is-whelling');
};

/**
 * Necessary.
 *
 * Enable the possibility to use preventDefault in global wheel event.
 *
 * - ByPass native wheel scroll.
 * - Used by unsubscribeWhellPrevent ( global window event ).
 */
MobMotionCore.setDefault({
    usePassive: false,
});

/** @type {import('./type').MobPageScroller} */
const MobPageScroller = ({ velocity, rootElement }) => {
    /**
     * Classic lerp tween.
     */
    let lerp = MobTween.createLerp({
        data: { scrollValue: window.scrollY },
        precision: 1,
        velocity: 0.1,
    });

    rootElementToObserve = rootElement;

    /**
     * Callback fire when user trigger wheel event.
     */
    const unsubscribe = lerp.subscribe(({ scrollValue }) => {
        if (isFreezed) return;

        window.scrollTo({
            top: Math.round(scrollValue),
            left: 0,
            behavior: 'instant',
        });
    });

    /**
     * Callback fire when lerp complete current scroll.
     */
    lerp.onComplete(() => {
        lastScrollValue = window.scrollY;
    });

    /**
     * Main handler.
     *
     * - Prepare value to move lerp instance.
     */
    const unsubscribeMouseWheel = MobCore.useMouseWheel((event) => {
        if (isFreezed) return;

        event.preventDefault();
        useNativeScroll = false;
        addWhellingClass();

        const spinY = event.spinY ?? 0;
        const currentValue = MobMotionCore.clamp(
            spinY * velocity + lastScrollValue,
            0,
            windowOffsetheight - windowInnerheight
        );

        lastScrollValue = currentValue;
        lerp.goTo({ scrollValue: currentValue }).catch(() => {});
    });

    /**
     * Disable native scroll on well event.
     *
     * - Scroll si controlled by lerp.
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
     * Update lerp without trigger lerp callback.
     *
     * - Normally this scroll is used when user use scrollbar.
     */
    const unsubscribeScroll = MobCore.useScroll(() => {
        if (!useNativeScroll) {
            return;
        }

        /**
         * Get crrent scrollY value.
         */
        const value = window.scrollY;
        lastScrollValue = value;

        /**
         * Update lerp store without trigger callback
         *
         * - Next time lerp fire callback start calculate from current scrollY.
         */
        lerp.setImmediate({ scrollValue: value });
    });

    /**
     * Stop lerp on pointerDown.
     *
     * - Stop lerp even is touch or mouse click.
     * - Simplest way to permite native scroll with scrollbar.
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
     *
     * - No lerp callback id fired.
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

            /**
             * Disconnect resizeObserver.
             */
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

/**
 * Freeze module without destroy.
 *
 * @type{() => void}
 */
export const FreezeMobPageScroll = () => {
    if (!isActive || isFreezed) return;

    stop();
    isFreezed = true;
};

/**
 * Unfreeze module.
 *
 * @type{() => void}
 */
export const UnFreezeMobPageScroll = () => {
    if (!isActive || !isFreezed) return;

    isFreezed = false;
};

/**
 * Freeze module without destroy anche update lerp without fire callback.
 *
 * @type{() => void}
 */
export const UnFreezeAndUPdateMobPageScroll = () => {
    if (!isActive || !isFreezed) return;

    update();
    lastScrollValue = window.scrollY;
    isFreezed = false;
};

/**
 * Update lerp without fire callback.
 *
 * @type{() => void}
 */
export const UpdateMobPageScroll = () => {
    if (!isActive) return;

    update();
};

/**
 * Destroy module.
 *
 * @type{() => void}
 */
export const DestroyMobPageScroll = () => {
    destroy();
};

/**
 * Utils:
 *
 * - Enable bypass native wheel event.
 *
 * @type{() => void}
 */
export const enebalePreventScroll = () => {
    usePrevent = true;
};

/**
 * Utils:
 *
 * - Disable bypass native wheel event.
 *
 * @type{() => void}
 */
export const disablePreventScroll = () => {
    usePrevent = false;
};

/**
 * Utils:
 *
 * - Get current active status.
 *
 * @type{() => boolean}
 */
export const getActiveStateScroll = () => {
    return isActive;
};
