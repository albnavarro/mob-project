import MobTween from '../../animation/tween/MobTween';

export interface MobSlide {
    tween: MobTween;
    unsubscribe: () => void;
}
