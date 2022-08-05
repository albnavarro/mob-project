import { SimpleStore } from '../../store/simpleStore.js';
import { handleSetUp } from '../../setup.js';

export const frameStore = new SimpleStore({
    currentFrame: 0,
    instantFps: handleSetUp.get('startFps'),
});
