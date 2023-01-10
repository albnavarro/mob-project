import { SimpleStore } from '../../store/simpleStore.js';
import { handleSetUp } from '../../setup.js';
import { NOOP } from '../../utils/functionsUtils.js';

export const frameStore = new SimpleStore({
    currentFrame: 0,
    instantFps: handleSetUp.get('startFps'),
    requestFrame: NOOP,
});
