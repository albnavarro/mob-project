import { HandleLerp } from './animation/lerp/handleLerp.js';
import { HandleSpring } from './animation/spring/handleSpring.js';
import { HandleTween } from './animation/tween/handleTween.js';
import { HandleSequencer } from './animation/sequencer/handleSequencer.js';
import { HandleAsyncTimeline } from './animation/asyncTimeline/handleAsyncTimeline.js';
import { HandleSyncTimeline } from './animation/syncTimeline/handleSyncTimeline.js';
import { HandleMasterSequencer } from './animation/sequencer/handleMasterSequencer.js';
import { ParallaxItemClass } from './animation/parallax/parallaxItem.js';
import { ParallaxTween } from './animation/parallax/parallaxTween.js';
import { SmoothScrollClass } from './animation/smoothScroller/smoothScroll.js';
import { SimpleStore } from './store/simpleStore.js';
import { createStaggers } from './animation/sequencer/sequencerUtils.js';

export const mobbu = {
    create(type, attributes) {
        switch (type) {
            case 'lerp':
                return new HandleLerp(attributes);

            case 'spring':
                return new HandleSpring(attributes);

            case 'tween':
                return new HandleTween(attributes);

            case 'sequencer':
                return new HandleSequencer(attributes);

            case 'asyncTimeline':
                return new HandleAsyncTimeline(attributes);

            case 'syncTimeline':
                return new HandleSyncTimeline(attributes);

            case 'masterSequencer':
                return new HandleMasterSequencer(attributes);

            case 'stagger':
                return createStaggers(attributes);

            case 'parallax':
                return new ParallaxItemClass(attributes);

            case 'parallaxTween':
                return new ParallaxTween(attributes);

            case 'smoothScroll':
                return new SmoothScrollClass(attributes);

            case 'store':
                return new SimpleStore(attributes);
        }
    },
};
