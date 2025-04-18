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
     * Available only on mouseWheel
     */
    spinX?: number;

    /**
     * Available only on mouseWheel
     */
    spinY?: number;

    /**
     * Available only on mouseWheel
     */
    pixelX?: number;

    /**
     * Available only on mouseWheel
     */
    pixelY?: number;
}

export type MouseEventCallback = (arg0: MouseEventParsed) => void;
