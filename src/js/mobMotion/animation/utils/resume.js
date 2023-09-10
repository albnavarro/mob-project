import { mobCore } from '../../../mobCore';

export const resume = (rafFn, resolve) => {
    mobCore.useFrame(() => {
        mobCore.useNextTick(({ time, fps }) => {
            rafFn(time, fps, resolve);
        });
    });
};
