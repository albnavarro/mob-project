export type scrollDirection = 'UP' | 'DOWN';

export interface handleScrollTypes {
    scrollY: number;
    direction: scrollDirection;
}

export interface handleScrollUtils {
    scrollY: number;
}

export type handleScrollCallback = (arg0: handleScrollTypes) => void;

export type handleScrollUtilsCallback = (arg0: handleScrollUtils) => void;
