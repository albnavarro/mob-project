// Costanti per la conversione dei delta
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * Normalizza un evento wheel standard fornendo sia valori in pixel che "spin" normalizzati.
 *
 * @param {any} event - L'oggetto evento wheel standard del browser
 * @returns {NormalizedWheel} Oggetto contenente i valori normalizzati dello scroll
 *
 * @typedef {Object} NormalizedWheel
 * @property {number} spinX - Velocità di rotazione normalizzata sull'asse X (+1 o -1 per singolo step)
 * @property {number} spinY - Velocità di rotazione normalizzata sull'asse Y (+1 o -1 per singolo step)
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
     * - Calcola lo "spin" (direzione/intensità normalizzata)
     * - Utile per controlli zoom dove vuoi step discreti invece di pixel continui
     */
    const spinX = pixelX === 0 ? 0 : pixelX < 0 ? -1 : 1;
    const spinY = pixelY === 0 ? 0 : pixelY < 0 ? -1 : 1;

    return {
        spinX,
        spinY,
        pixelX,
        pixelY,
    };
}
