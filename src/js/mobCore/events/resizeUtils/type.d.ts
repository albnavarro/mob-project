export interface HandleResize {
    scrollY: number;
    windowsHeight: number;
    windowsWidth: number;
    documentHeight: number;
    verticalResize: boolean;
    horizontalResize: boolean;
}

export type HandleResizeCallback = (arg0: HandleResize) => void;
