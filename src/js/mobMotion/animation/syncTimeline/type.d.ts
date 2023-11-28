export interface syncTimelineType {
    duration?: number;
    yoyo?: boolean;
    repeat?: number;
}

export interface syncTimelineSequencers {
    draw: function;
    getLabels: function;
    inzializeStagger: function;
    disableStagger: function;
    cleanCachedId: function;
    resetLastValue: function;
    destroy: function;
    setStretchFactor: function;
}

export interface syncTimelineEventType {
    id: number;
    cb: function;
}
