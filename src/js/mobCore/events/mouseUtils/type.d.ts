export type MouseEventType =
    | 'click'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'wheel';

export interface MouseEventParsed {
    page: {
        x: number;
        y: number;
    };
    client: {
        x: number;
        y: number;
    };
    target: EventTarget | null;
    type: MouseEventType;
    preventDefault: () => void;

    /**
     * @description
     * available only on mouseWheel
     */
    spinX?: number;

    /**
     * @description
     * available only on mouseWheel
     */
    spinY?: number;

    /**
     * @description
     * available only on mouseWheel
     */
    pixelX?: number;

    /**
     * @description
     * available only on mouseWheel
     */
    pixelY?: number;
}

export type MouseEventCallback = (arg0: MouseEventParsed) => void;
