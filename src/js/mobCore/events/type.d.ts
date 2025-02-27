export interface EventStore {
    usePassive: boolean;
    currentFrame: number;
    instantFps: number;
    requestFrame: () => void;
    deferredNextTick: boolean;
    throttle: number;
    spinYMaxValue: number;
    spinXMaxValue: number;
}
