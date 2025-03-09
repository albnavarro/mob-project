export interface VisibilityChange {
    visibilityState: 'hidden' | 'visible';
}

export type VisibilityChangeCallback = (arg0: VisibilityChange) => void;
