export type MobPageScroller = (arg0: {
    velocity: number;
    rootElement: HTMLElement;
}) => {
    destroy: () => void;
    stop: () => void;
    update: () => void;
};
