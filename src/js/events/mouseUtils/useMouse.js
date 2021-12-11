import { normalizeWheel } from './normalizeWhell.js';

/**
 * Utils to centralize mouse listener, all subscriber use the same listener
 * First subscriber create a listener, when there are no more listeners the listern is removed
 *
 * NOTE:
 * Use it inside onMount function to be sure callback is added after first rendering in case of server side rendering
 * https://svelte.dev/tutorial/onmount
 *
 * @example:
 * onMount(() => {
 *   const unsubscribe = useMouseMove(({client}) => console.log(client.x));
 *   return(() => unsubscribe())
 * }
 *
 */

function useMouse(event) {
    let inizialized = false;
    let callback = [];
    let id = 0;

    /**
     * handler - handler for mouse move
     *
     * @param  {event} e mouse move event
     * @return {void}   description
     */
    function handler(e) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener(event, handler);

            inizialized = false;
            return;
        }

        // Get event type
        const type = e.type;

        // Get page coord
        const { pageX, pageY } = (() => {
            // 'touchend'
            if (type === 'touchend' && e.changedTouches)
                return e.changedTouches[0];

            // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
            return e.touches ? e.touches[0] : e;
        })();

        // Get client coord
        const { clientX, clientY } = (() => {
            // 'touchend'
            if (type === 'touchend' && e.changedTouches)
                return e.changedTouches[0];

            // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
            return e.touches ? e.touches[0] : e;
        })();

        // Get target
        const target = e.target;

        // Prepare data to callback
        const mouseData = {
            page: {
                x: pageX,
                y: pageY,
            },
            client: {
                x: clientX,
                y: clientY,
            },
            target,
            type,
            preventDefault: () => e.preventDefault(),
        };

        // Add spin value if is wheel event
        if (type === 'wheel') {
            const { spinX, spinY, pixelX, pixelY } = normalizeWheel(e);
            Object.assign(mouseData, { spinX, spinY, pixelX, pixelY });
        }

        callback.forEach(({ cb }) => {
            cb(mouseData);
        });
    }

    /**
     * init - if istener is not inizializad remove it
     *
     * @return {void}
     */
    function init() {
        if (inizialized) return;
        inizialized = true;

        window.addEventListener(event, handler, {
            passive: false,
        });
    }

    /**
     * init - add call back to stack
     *
     * @return {function} unsubscribe function
     */
    const addCb = (cb) => {
        callback.push({ cb, id: id });
        const cbId = id;
        id++;

        if (typeof window !== 'undefined') {
            init();
        }

        return () => {
            callback = callback.filter((item) => item.id !== cbId);
        };
    };

    return addCb;
}

export const useMouseClick = new useMouse(['click']);
export const useMouseDown = new useMouse(['mousedown']);
export const useTouchStart = new useMouse(['touchstart']);
export const useMouseMove = new useMouse(['mousemove']);
export const useTouchMove = new useMouse(['touchmove']);
export const useMouseUp = new useMouse(['mouseup']);
export const useTouchEnd = new useMouse(['touchend']);
export const useMouseWheel = new useMouse(['wheel']);
