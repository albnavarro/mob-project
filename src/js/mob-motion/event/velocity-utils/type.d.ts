export type VelocityMap = Map<string, VelocityCallback>;

export type VelocityCallback = (arg0: VelocityParams) => void;

export interface VelocityParams {
    speed: number;
    rawSpeed: number;
    rawSpeedX: number;
    rawSpeedY: number;
    speedX: number;
    speedY: number;
    clientX: number;
    clientY: number;
    directionX: number;
    directionY: number;
    distance: number;
    completed: boolean;
    pointerEnd: boolean;
}
