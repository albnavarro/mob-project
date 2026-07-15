import { MobCore } from '../../../mob-core/index.js';
import MobSpring from '../../animation/spring/mob-spring';

let previousClientX = 0;
let previousClientY = 0;
let previousTime = 0;
let firstMove = false;
let currentClientX = 0;
let currentClientY = 0;
let pointerEnd = false;
let rawSpeed = 1;
let rawSpeedX = 1;
let rawSpeedY = 1;

/**
 * - TotalDistance: valore "secco" sincronizzato con l'evento fisico di stop.
 * - Si resetta immediatamente al nuovo movimento,
 * - Utile per logiche che devono reagire istantaneamente al "nuovo inizio" senza aspettare lerp.
 */
let totalDistance = 1;

/**
 * - Detect immediato dell'evento stop del mouse.
 * - Questo valore é sincronizzato con totalDistance.
 */
let completed = false;

/**
 * Direction
 *
 * - -1 : left | top
 * - 1 : right | bottom
 * - 0 : neutral position
 */
let currentDirectionX = 0;
let currentDirectionY = 0;

/**
 * Params to detect threshold to detect mouse move.
 */
const directionTresholdBase = 2;
const EXP_GROWTH_FACTOR = 0.6;
const THRESHOLD_CAP = 60;
let previousThreshold = directionTresholdBase;

/**
 * Il threshold scende lentamente con una logica di tupo LERP
 *
 * Più basso = scende più lentamente (0.1-0.5)
 */
const RELEASE_LERP = 0.1;

/**
 * @type {boolean}
 */
let initialized = false;

/** @type {any} */
let debounceTimeoutId = null;

/**
 * Perché debounce invece di pointerup/pointerleave?
 *
 * Tracciamo il MOVIMENTO, non la pressione. L'utente può:
 *
 * - Fermare il mouse senza rilasciare (hover)
 * - Uscire dalla finestra (leave) ma non avere "fermato" intenzionalmente
 *
 * Il debounce di 200ms (tuning empirico) definisce "stop" come: "nessun movimento rilevante per X ms",
 * indipendentemente da pressione o posizione.
 */
const DEBOUNCE_DELAY = 200;

/**
 * Tolleranza pausa (sotto: stesso movimento)
 */
const GAP_MAX = 120;

/** @type {any} */
let gapTimeoutId = null;

let unsubscribeDetectStart = () => {};
let unsubscribeDetectEnd = () => {};
let unsubscribePointerMove = () => {};

/**
 * @type {import('@mobMotionType').MobSpring}
 */
let tweenInstance;

/**
 * @type {import('./type').VelocityMap}
 */
const callbacks = new Map();

/**
 * Calcola il threshold dinamico con curva esponenziale
 *
 * - Minimo: 2px (movimento fermo/lento)
 * - Cresce esponenzialmente con la velocità
 *
 * @param {number} currentSpeed
 * @returns {number}
 */
const getDynamicTreshold = (currentSpeed) => {
    if (currentSpeed <= 1) return directionTresholdBase;

    const exponentialMultiplier = Math.exp(
        (currentSpeed - 1) * EXP_GROWTH_FACTOR
    );

    return Math.min(
        directionTresholdBase * exponentialMultiplier,
        THRESHOLD_CAP
    );
};

/**
 * @param {PointerEvent} params
 */
const updateVelocity = ({ clientX, clientY }) => {
    if (!tweenInstance) return;

    currentClientX = clientX;
    currentClientY = clientY;
    const diffX = clientX - previousClientX;
    const diffY = clientY - previousClientY;
    const time = MobCore.getTime();
    const diffTime = time - previousTime;

    /**
     * Al primo movimento torniamo un valore 1 neutro.
     *
     * - PreviousClientY & previousClientX non sarebbero coerenti.
     */
    if (firstMove || diffTime === 0) {
        /**
         * Aggiorna storico
         */
        previousClientX = clientX;
        previousClientY = clientY;
        previousTime = time;
        rawSpeed = 1;
        rawSpeedX = 1;
        rawSpeedY = 1;

        /**
         * Reset anche del threshold quando ricomincia
         */
        previousThreshold = directionTresholdBase;

        tweenInstance.goTo(
            {
                speed: 1,
                speedX: 1,
                speedY: 1,
            }
            /**
             * Lerp logic fi needed:{ velocity: 0.02 }
             */
        );

        return;
    }

    /**
     * Track total distance
     *
     * - Il calcolo dell' ipotenusa resituisce sempre un valore positivo.
     * - Questo rende inutile l' uso di Math.abs()
     */
    const distance = Math.hypot(diffX, diffY);
    totalDistance += distance;

    const vx = diffX / diffTime;
    const vy = diffY / diffTime;
    const speed = Math.hypot(vx, vy);
    const targetThreshold = getDynamicTreshold(speed);

    /**
     * Asymmetric lerp: sale istantaneo, scende lento
     *
     * - Su movimento veloce (target > previous): reazione immediata per non perdere la direzione reale dell'utente.
     * - Su rallentamento: transizione morbida per evitare flicker di direzione quando il mouse si ferma con
     *   micro-tremori.
     */
    if (targetThreshold > previousThreshold) {
        /**
         * Attack: istantaneo
         */
        previousThreshold = targetThreshold;
    } else {
        /**
         * Release: lento
         */
        previousThreshold +=
            (targetThreshold - previousThreshold) * RELEASE_LERP;
    }

    if (Math.abs(diffX) > previousThreshold)
        currentDirectionX = Math.sign(diffX);

    if (Math.abs(diffY) > previousThreshold)
        currentDirectionY = Math.sign(diffY);

    rawSpeed = Math.max(1, Math.round((speed + 1) * 10_000) / 10_000);
    rawSpeedX = Math.max(1, Math.round((Math.abs(vx) + 1) * 10_000) / 10_000);
    rawSpeedY = Math.max(1, Math.round((Math.abs(vy) + 1) * 10_000) / 10_000);

    tweenInstance.goTo(
        {
            speed: rawSpeed,
            speedX: rawSpeedX,
            speedY: rawSpeedY,
        }
        /**
         * Lerp logic if needed:{ velocity: 0.02 }
         *
         * - Quando l'evento end viene scatenato useremo un easing piu secco per tornare al valore neutro.
         */
    );

    previousClientX = clientX;
    previousClientY = clientY;
    previousTime = time;
};

/**
 * Detect dell' evento virutale pointerMove.
 *
 * - Dobbiamo riallineare il valore di previousTime.
 */
const initDetectStart = () => {
    unsubscribeDetectStart = MobCore.usePointerMove(() => {
        unsubscribeDetectStart();
        previousTime = MobCore.getTime();
        completed = false;

        /**
         * - TotalDistance é coerente con l'evento reale ( fisico ) di stop.
         * - Fino a che abbiamo un timeOut attivo consideriamo il movimento come `in corso`.
         * - Stiamo considerando movimenti ravvicinati come un unico movimento.
         */
        if (gapTimeoutId) {
            /**
             * - Siamo dentro il gap di sicurezza, qui possiamo fermarlo
             * - Al prossimo `evento` di end verrá creato un nuovo timeOut.
             */
            clearTimeout(gapTimeoutId);
            gapTimeoutId = null;
        } else {
            /**
             * - Al primo movimento in cui il timeOut é risolto azzeriamo la distanza.
             * - La resettiamo sempre e solo al primo movimento abbastanza distante a livello temporale dall' ultimo
             *   movimento.
             */
            totalDistance = 1;
            pointerEnd = false;
        }

        /**
         * Set first iteration
         */

        firstMove = true;
    });
};

/**
 * Detect dell' evento pointerMove reale.
 */
const initPointerMove = () => {
    unsubscribePointerMove = MobCore.usePointerMove((event) => {
        updateVelocity(event);

        /**
         * After start => move first iteration is consumed.
         */
        if (firstMove) firstMove = false;
    });
};

/**
 * Clear pending debounce
 */
const clearPendingDebounce = () => {
    if (!debounceTimeoutId) {
        return;
    }

    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = null;
};

/**
 * Ri-inizializzazione ciclica dei listener per garantire ordine esatto:
 *
 * 1. Start (prima) -> 2. Move -> 3. End (ultima)
 *
 * Map garantisce ordine di inserimento. Questo é necessario perché:
 *
 * - L'evento "move" fisico può fire prima del nostro "start" virtuale
 * - L'ordine Start -> Move -> End deve essere invariante per i subscriber
 *
 * Costo prestazionale: 3 subscription ogni 200ms di inattività (trascurabile).
 */
const onPointerEnd = () => {
    if (!tweenInstance) return;

    tweenInstance.goTo(
        {
            speed: 1,
            speedX: 1,
            speedY: 1,
        }

        /**
         * Detect dell' evento pointerMove reale.
         */
    );

    currentDirectionX = 0;
    currentDirectionY = 0;
    previousThreshold = directionTresholdBase;

    /**
     * Gestiamo un gap temporale per considerare movimenti ravvicinati come un unico movimento.
     */
    gapTimeoutId = setTimeout(() => {
        gapTimeoutId = null;
        completed = true;
        rawSpeed = 1;
        rawSpeedX = 1;
        rawSpeedY = 1;
        pointerEnd = true;
    }, GAP_MAX);

    /**
     * - Il primo evento deve essere sempre start.
     * - L' evento move dese essere sempre successivo a start.
     *
     * Per questo motivo prima dobbiamo:
     *
     * - 1. Rimuovere l'evento move
     * - 2- Iscriversi dopo che l'evento start é stato ricreato
     * - 3. La callback usano Map che garantisce l' ordine di inserimento
     *
     * In questo modo l'ordine degli eventi sará sempre:
     *
     * - 1. Start
     * - 2. Move
     * - 3. End
     */
    unsubscribePointerMove();
    unsubscribeDetectEnd();
    initDetectStart();
    initPointerMove();
    initPointerEnd();
};

/**
 * Detect dell' evento virtuale pointerEnd.
 */
const initPointerEnd = () => {
    clearPendingDebounce();

    const debouceFunctionReference = () => {
        clearPendingDebounce();

        debounceTimeoutId = setTimeout(() => {
            debounceTimeoutId = null;
            onPointerEnd();
        }, DEBOUNCE_DELAY);
    };

    unsubscribeDetectEnd = MobCore.usePointerMove(debouceFunctionReference);
};

const init = () => {
    if (initialized) return;
    initialized = true;

    /**
     * Init handler
     */
    initDetectStart();
    initPointerMove();
    initPointerEnd();

    /**
     * Init Lerp
     *
     * Il valore di speed `neutro` é 1 in quanto verrá usato come moltiplicatore.
     */
    tweenInstance = new MobSpring({
        data: {
            speed: 1,
            speedX: 1,
            speedY: 1,
        },
    });

    /**
     * Subscribe lerp
     *
     * - Restituisce il valore durante l'interpolazione
     * - Quando la velicitá degli assi e 1 per coerenza il valore della direzione sará 1.
     */
    tweenInstance.subscribe(({ speed, speedX, speedY }) => {
        /**
         * Usiamo nextTick per disaccopiare la callback dal requestAnimationFrame. Il request animation frame sará
         * gestito dall' utente se ne ha bisogno.
         */
        MobCore.useNextTick(() => {
            for (const callback of callbacks.values()) {
                callback({
                    speed,
                    speedX,
                    speedY,
                    clientX: currentClientX,
                    clientY: currentClientY,
                    directionX: currentDirectionX,
                    directionY: currentDirectionY,
                    distance: totalDistance,
                    completed,
                    pointerEnd,
                    rawSpeed,
                    rawSpeedX,
                    rawSpeedY,
                });
            }
        });
    });

    /**
     * Alla fine dell' interpolazione resettiamo la direzione a 1 ( valore neutro )
     *
     * - OnComplete é sempre l'ultima callback.
     */
    tweenInstance.onComplete(({ speed, speedX, speedY }) => {
        /**
         * Usiamo nextTick per disaccopiare la callback dal requestAnimationFrame. Il request animation frame sará
         * gestito dall' utente se ne ha bisogno.
         */
        MobCore.useNextTick(() => {
            for (const callback of callbacks.values()) {
                callback({
                    speed,
                    speedX,
                    speedY,
                    clientX: currentClientX,
                    clientY: currentClientY,
                    directionX: 0,
                    directionY: 0,
                    distance: totalDistance,
                    completed,
                    pointerEnd,
                    rawSpeed,
                    rawSpeedX,
                    rawSpeedY,
                });
            }
        });
    });
};

/**
 * /** Reset completo dello stato al cleanup.
 *
 * Quando callbacks.size === 0, nessuno sta usando il modulo -> é una nuova sessione. Stati come previousThreshold o
 * totalDistance non hanno senso persistere senza subscriber attivi.
 *
 * NOTA: Se ci sono N subscriber attivi, condividono lo stato. Il reset avviene solo quando l'ultimo se ne va.
 *
 * @example
 *     ```javascript
 *
 *     const unsubscribe = handleVelocity(() => {
 *         ...
 *     });
 *
 *     ```;
 *
 * @param {import('./type').VelocityCallback} cb
 * @returns {() => void}
 */
const addCallback = (cb) => {
    if (globalThis.window === undefined) {
        return () => {};
    }

    const id = MobCore.getUnivoqueId();
    callbacks.set(id, cb);
    init();

    return () => {
        callbacks.delete(id);

        if (callbacks.size === 0 && initialized) {
            if (gapTimeoutId) {
                clearTimeout(gapTimeoutId);
                gapTimeoutId = null;
            }

            unsubscribeDetectStart();
            unsubscribeDetectEnd();
            unsubscribePointerMove();
            tweenInstance.destroy();
            // @ts-ignore
            tweenInstance = null;
            initialized = false;

            /**
             * Reset state.
             */
            previousClientX = 0;
            previousClientY = 0;
            previousTime = 0;
            firstMove = false;
            currentDirectionX = 0;
            currentDirectionY = 0;
            currentClientX = 0;
            currentClientY = 0;
            previousThreshold = directionTresholdBase;
            totalDistance = 1;
            completed = false;
            pointerEnd = false;
            rawSpeed = 1;
            rawSpeedX = 1;
            rawSpeedY = 1;
        }
    };
};

/**
 * Function to execute a callback on page load
 */
export const handleVelocity = addCallback;
