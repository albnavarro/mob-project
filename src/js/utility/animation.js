import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/all';
import { outerHeight } from '../core/utils/vanillaFunction.js';

export function slideUpDownReset(target) {
    target.style.height = 0;
    target.style.overflow = 'hidden';
}

export function slideUp(target, duration = 0.5, ease = 'Power4.easeOut') {
    return new Promise((res, reject) => {
        gsap.to(target, {
            height: 0,
            ease: ease,
            duration: duration,
            onComplete: res,
        });
    });
}

export function slideDown(target, duration = 0.5, ease = 'Power4.easeOut') {
    return new Promise((res, reject) => {
        target.style.height = null;
        const height = outerHeight(target);
        target.style.height = 0;
        gsap.to(target, {
            height: height,
            ease: ease,
            duration: duration,
            onComplete: () => {
                target.style.height = 'auto';
                res();
            },
        });
    });
}

export function bodyScrollTo(value, duration = 0.5, ease = 'Power4.easeOut') {
    gsap.registerPlugin(ScrollToPlugin);

    return new Promise((res, reject) => {
        gsap.to(window, {
            scrollTo: value,
            ease: ease,
            duration: duration,
            onComplete: res,
        });
    });
}
