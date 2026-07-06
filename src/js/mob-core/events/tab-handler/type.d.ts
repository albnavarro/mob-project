export type TabDirection = 'BACKWARD' | 'FORWARD';

export type TabHandlerCallback = (arg0: {
    direction: TabDirection;
    preventDefault: () => void;
}) => void;
