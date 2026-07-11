// Costanti per la conversione dei delta
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * Passo di riferimento per convertire i pixel in "spin".
 *
 * - Lo spin mantiene la MAGNITUDO dello scroll ( non è clampato a ±1 ), così una rotellata veloce o una
 *   rotella hi-res producono uno spin più grande, come faceva `legacy.js` con `-wheelDeltaY / 120`.
 * - Con una tacca standard `deltaY` ≈ 100, quindi `SPIN_STEP = 100` dà spin ≈ 1 per tacca ( match col legacy ).
 * - È la manopola di taratura: aumentalo per rendere lo spin meno sensibile, diminuiscilo per il contrario.
 */
const SPIN_STEP = 100;

/**
 * Normalizza un evento wheel standard fornendo sia valori in pixel che "spin" normalizzati.
 *
 * @param {any} event - L'oggetto evento wheel standard del browser
 * @returns {NormalizedWheel} Oggetto contenente i valori normalizzati dello scroll
 *
 * @typedef {Object} NormalizedWheel
 * @property {number} spinX - Intensità/direzione normalizzata sull'asse X ( ≈ ±1 per tacca, scala con la velocità )
 * @property {number} spinY - Intensità/direzione normalizzata sull'asse Y ( ≈ ±1 per tacca, scala con la velocità )
 * @property {number} pixelX - Distanza in pixel sull'asse X (sempre in pixel, indipendentemente da deltaMode)
 * @property {number} pixelY - Distanza in pixel sull'asse Y (sempre in pixel, indipendentemente da deltaMode)
 */
export function normalizeWheel(event) {
    /**
     * Estrai i delta standard dall'evento WheelEvent
     */
    let pixelX = event.deltaX ?? 0;
    let pixelY = event.deltaY ?? 0;

    /**
     * Gestisci deltaMode:
     *
     * - Converte LINE (1) e PAGE (2) in pixel DOM_DELTA_PIXEL = 0,
     * - DOM_DELTA_LINE = 1,
     * - DOM_DELTA_PAGE = 2
     */
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        pixelX *= LINE_HEIGHT;
        pixelY *= LINE_HEIGHT;
    } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        pixelX *= PAGE_HEIGHT;
        pixelY *= PAGE_HEIGHT;
    }

    // Se DOM_DELTA_PIXEL (0) o undefined, lascia i valori così come sono

    /**
     * Calcola lo "spin" mantenendo la magnitudo ( proporzionale ai pixel ).
     *
     * - `legacy.js` derivava lo spin da `-wheelDeltaY / 120`, che scala con l'intensità dello scroll.
     * - I consumatori ( page-scroller, smooth-scroller ) fanno `spinY * velocity`, quindi qui serve la
     *   magnitudo, NON il solo segno: clampare a ±1 renderebbe ogni evento uno step fisso ( scroll piatto ).
     */
    const spinX = pixelX / SPIN_STEP;
    const spinY = pixelY / SPIN_STEP;

    return {
        spinX,
        spinY,
        pixelX,
        pixelY,
    };
}
