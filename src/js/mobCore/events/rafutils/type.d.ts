export interface handleFrameType {
    /**
     * @description
     * The total activity time of the request animation frame
     */
    time: number;

    /**
     * @description
     * Current fps value, the starting fps value is 60.
     * The effective value of the fps property will occur 30 frames after the initialization of handleFrame,
     * 30 frames the minimum interval to have a correct result.
     */
    fps: number;

    /**
     * @description
     * If the useScaleFps global property is on,
     * the property indicates whether there is a drop in frame rate compared
     * to the optimal frame rate calculated at application startup.
     */
    shouldRender: boolean;
}

export type handleFrameCallbakType = (arg0: handleFrameType) => void;

export type handleFrameArrayType = handleFrameCallbakType[];

export interface loadFpsTypes {
    /**
     * @description
     * Detected fps value
     */
    averageFPS: number;
}

export type loadFpsCallback = (arg0: loadFpsTypes) => void;
