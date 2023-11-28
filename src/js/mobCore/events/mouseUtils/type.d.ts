export type mouseEvent =
    | 'click'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'wheel';

export interface mouseEventTypes {
    page: {
        x: number;
        y: number;
    };
    client: {
        x: number;
        y: number;
    };
    target: Element;
    type: mouseEvent;
    preventDefault: function;

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

export type mouseEventCallback = (arg0: mouseEventTypes) => void;
