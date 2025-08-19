import { MobCore } from '../../../mob-core';

/**
 * - Execute request animation frame init function.
 * - After default run, execute user function if there is one.
 * - Validate function start from external tool ( eg: asynctimeline ).
 *
 * @param {object} params
 * @param {{ validation: () => boolean; callback: () => void }[]} params.validationFunction
 * @param {(time: number, fps: number) => void} params.defaultRafInit
 * @returns {void}
 */
export const initRaf = ({ validationFunction, defaultRafInit }) => {
    MobCore.useFrame(() => {
        MobCore.useNextTick(({ time, fps }) => {
            /**
             * Find first validation that retrurn true from last inserted.
             */
            const result = validationFunction.findLast(({ validation }) =>
                validation()
            );

            /**
             * Default run
             */
            defaultRafInit(time, fps);

            /**
             * After default initialization launch custom function if there is one. Fire callback
             */
            if (result) {
                result?.callback();
                console.log('custom tween run function extrecuted');
                return;
            }
        });
    });
};
