export type VelocityMap = Map<string, VelocityCallBack>;

export type VelocityCallBack = (arg0: VelocityParams) => void;

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
