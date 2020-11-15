import {gsap} from "gsap";

export function slideUp(target, duration = .5) {
    return new Promise((res, reject) => {
        gsap.to(target, {height: 0, duration: duration, onComplete:res});
    });
}

export function slideDown(target, duration = .5) {
    return new Promise((res, reject) => {
        target.style.height = null;
        const height = target.offsetHeight;
        target.style.height = 0;
        gsap.to(target, {height: height, duration: duration, onComplete:res});
    });
}
