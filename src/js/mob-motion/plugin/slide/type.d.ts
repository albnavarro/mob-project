import MobTimeTween from '../../animation/tween/mob-time-tween';

export interface MobSlide {
    tween: MobTimeTween;
    unsubscribe: () => void;
}
