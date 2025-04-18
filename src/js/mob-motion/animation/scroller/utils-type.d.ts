export interface scrollTriggerLimitValues {
    numberVal: string | number;
    unitMisure: string;
    additionalVal: string;
    position: string;
}

export interface scrollTriggerStartEndPartials {
    value: number;
    additionalVal: string;
    position: string;
}

export interface scrollTriggerIsInviewPort {
    offset: number;
    height: number;
    gap: number;
    wScrollTop: number;
    wHeight: number;
}
