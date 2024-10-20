import HandleTween from '../../animation/tween/handleTween';

export interface Slide {
    tween: HandleTween;
    unsubscribe: () => void;
}
