import { HandleTween } from '../tween/handleTween.js';
import { offset, isNode } from '../../utils/vanillaFunction.js';

/**
 * scroll body to values
 *
 * @example:
 *  bodyScroll.to({
 *    target: 3000 // target === number
 *    duration: 1500,
 *    ease: 'easeOutBack',
 *    prevent: false,
 *  }).then((value) => console.log('end'));
 *
 *  bodyScroll.to({
 *    target: document.querySelector('.el') // target === node
 *  }).then((value) => console.log('end'));
 */
export const bodyScroll = (() => {
    const defaultPreset = 'easeOutQuad';
    const tween = new HandleTween({ ease: defaultPreset, data: { val: 0 } });

    tween.subscribe(({ val }) => {
        document.documentElement.scrollTop = val;
    });

    function to(data) {
        if (typeof window !== 'undefined') {
            const target = (() => {
                if ('target' in data) {
                    // Check if target is a Node or a Number
                    const isValid =
                        isNode(data.target) ||
                        !Number.isNaN(parseInt(data.target));

                    // Skip if target is not valid
                    if (!isValid) {
                        console.warn(
                            `bodyScroll ${data.target} is not valid target, must be a node or a number`
                        );
                        return 0;
                    }

                    // Get value or get value from Node
                    const targetIsNode = isNode(data.target);
                    return targetIsNode ? offset(data.target).top : data.target;
                } else {
                    return 0;
                }
            })();
            const duration = data.duration || 500;
            const ease = data.ease;
            const prevent = 'prevent' in data ? data.prevent : false;
            const scrollNow = window.pageYOffset;

            if (prevent) document.body.style.overflow = 'hidden';
            if (ease) tween.updatePreset(ease);

            return new Promise((res, reject) => {
                tween
                    .goFromTo({ val: scrollNow }, { val: target }, { duration })
                    .then(() => {
                        if (prevent) document.body.style.overflow = '';
                        if (ease) tween.updatePreset(defaultPreset);
                        res();
                    })
                    .catch(() => {
                        reject();
                    });
            });
        }
    }

    return {
        to,
    };
})();
