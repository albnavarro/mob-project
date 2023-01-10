import HandleLerp from './animation/lerp/handleLerp.js';
import ParallaxTween from './animation/parallax/parallaxTween.js';
import HandleMasterSequencer from './animation/sequencer/handleMasterSequencer.js';
import HandleSequencer from './animation/sequencer/handleSequencer.js';
import HandleSpring from './animation/spring/handleSpring.js';
import HandleTween from './animation/tween/handleTween.js';
import { createStaggers } from './animation/sequencer/sequencerUtils.js';

export const tween = {
    /**
     * @param { import('./animation/parallax/parallaxTween.js').parallaxTweenTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myParallaxTween = tween.createParallaxTween({
     *   from: Object.<string, number>,
     *   to: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Simplified tween specific to be used with scrollTrigger as an alternative to the more complex sequencer, ParallaxTween requires only one mutation step (from / to).
     * <br/>
     *
     * Available methods:
     * ```js
     * myParallaxTween.subscribe()
     * myParallaxTween.subscribeCache()
     * myParallaxTween.onStop()
     *
     * ```
     */
    createParallaxTween(data = {}) {
        return new ParallaxTween(data);
    },

    /**
     * @param {import('./animation/sequencer/handleSequencer.js').sequencerTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('../core/animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const mySequencer = tween.createSequencer({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * mySequencer.goTo()
     * mySequencer.goFrom()
     * mySequencer.goFromTo()
     * mySequencer.add()
     * mySequencer.label()
     * mySequencer.subscribe()
     * mySequencer.subscribeCache()
     * mySequencer.onStop()
     *
     * ```
     */
    createSequencer(data = {}) {
        return new HandleSequencer(data);
    },

    /**
     * @description
     *
     * Support class for grouping multiple sequencers.
     * Very useful when generating sequencers dynamically, such as through the use of a createStagger.
     * <br/>
     * The following example uses a timeline but the same can be done using a scrollTrigger
     * <br/>
     *
     *
     * @example
     *
     * ```js
     * cont masterSequencer = tween.createMasterSequencer();
     * const staggers = tween.createStaggers({})
     * staggers.forEach(({ item, start, end, index }) => {
     *     const sequencer = tween
     *         .createSequencer({ ... })
     *         .goTo({ ... }, { start, end ...});
     *     sequencer.subscribe(({ ... }) => { ... });
     *     masterSequencer.add(sequencer);
     * });
     * const timeline = timeline.createSyncTimeline({}).add(masterSequencer)
     * ```
     */
    createMasterSequencer() {
        return new HandleMasterSequencer();
    },

    /**
     * @param { import('./animation/sequencer/sequencerUtils.js').createSequencerTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes } data
     * @returns {Array<{ start: Number, end: Number,index: Number, item: (HTMLElement|Object) }>} Stagger array
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const staggers = tween.createStaggers({
     *     items: Array.<Element|Object>,
     *     stagger: {
     *         type: [ String ],
     *         from: [ Number|String|{x:number,y:number} ],
     *         grid: {
     *             col: [ Number ],
     *             row: [ Number ],
     *             direction: [ String ]
     *         },
     *     },
     *     duration: [ Number ],
     * });
     *
     *
     * staggers.forEach(({ item, start, end, index }) => {
     *     const sequencer = tween
     *         .createSequencer({ ... })
     *         .goTo({ ... }, { start, end ...});
     *     sequencer.subscribe(({ ... }) => { ... });
     *     masterSequencer.add(sequencer);
     * });
     *
     * ```
     *
     * @description
     *
     * ```
     */
    createStaggers(data = {}) {
        return createStaggers(data);
    },

    /**
     * @param { import('./animation/tween/handleTween.js').tweenTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myTween = tween.createTween({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myTween.set()
     * myTween.goTo()
     * myTween.goFrom()
     * myTween.goFromTo()
     * myTween.subscribe()
     * myTween.subscribeCache()
     * myTween.onComplete()
     * myTween.updateEase()
     * myTween.getId()
     * myTween.get()
     * myTween.getTo()
     * myTween.getFrom()
     * myTween.getToNativeType()
     * myTween.getFromNativeType()
     *
     * ```
     */
    createTween(data = {}) {
        return new HandleTween(data);
    },

    /**
     * @param { import('./animation/spring/handleSpring.js').springTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/spring/springConfig.js').springConfigTypes & import('./animation/spring/springConfig.js').springConfigPropsTypes} data
     *
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const mySpring = tween.createSpring({
     *   data: Object.<string, number>,
     *   config: [ String ],
     *   configProp: {
     *      tension: [ Number ],
     *      mass: [ Number ],
     *      friction: [ Number ],
     *      velocity: [ Number ],
     *      precision: [ Number ],
     *   },
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ],
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * mySpring.set()
     * mySpring.goTo()
     * mySpring.goFrom()
     * mySpring.goFromTo()
     * mySpring.subscribe()
     * mySpring.subscribeCache()
     * mySpring.onComplete()
     * mySpring.updateConfigProp()
     * mySpring.updateConfig()
     * mySpring.getId()
     * mySpring.get()
     * mySpring.getTo()
     * mySpring.getFrom()
     * mySpring.getToNativeType()
     * mySpring.getFromNativeType()
     *
     * ```
     */
    createSpring(data = {}) {
        return new HandleSpring(data);
    },

    /**
     * @param { import('./animation/lerp/handleLerp.js').lerpTypes & import('./animation/lerp/handleLerp.js').lerpPropTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes } data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myLerp = tween.createLerp({
     *   data: Object.<string, number>,
     *   precision: [ Number ],
     *   velocity: [ Number ],
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ],
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myLerp.set()
     * myLerp.goTo()
     * myLerp.goFrom()
     * myLerp.goFromTo()
     * myLerp.subscribe()
     * myLerp.subscribeCache()
     * myLerp.onComplete()
     * myLerp.updateVelocity()
     * myLerp.updatePrecision()
     * myLerp.getId()
     * myLerp.get()
     * myLerp.getTo()
     * myLerp.getFrom()
     * myLerp.getToNativeType()
     * myLerp.getFromNativeType()
     *
     * ```
     */
    createLerp(data = {}) {
        return new HandleLerp(data);
    },
};
