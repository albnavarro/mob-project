export interface visibilityChangeTypes {
    visibilityState: 'hidden' | 'visible';
}

export type visibilityChangeCallback = (arg0: visibilityChangeTypes) => void;
