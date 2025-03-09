import MobTimeTween from '../../animation/tween/MobTimeTween';

export interface MobSlide {
    tween: MobTimeTween;
    unsubscribe: () => void;
}
