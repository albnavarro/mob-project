export interface handleResizeType {
    scrollY: number;
    windowsHeight: number;
    windowsWidth: number;
    documentHeight: number;
    verticalResize: boolean;
    horizontalResize: boolean;
}

export type handleResizeCallback = (arg0: handleResizeType) => void;
