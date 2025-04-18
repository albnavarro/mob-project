export type ScrollDirection = 'UP' | 'DOWN';

export interface HandleScroll {
    scrollY: number;
    direction: ScrollDirection;
}

export interface HandleScrollUtils {
    scrollY: number;
}

export type HandleScrollCallback<T> = (arg0: T) => void;
