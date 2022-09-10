export class HandleMasterSequencer {
    constructor() {
        this.type = 'sequencer';
        this.children = [];
    }

    draw({ partial, isLastDraw, useFrame }) {
        this.children.forEach((item) => {
            item.draw({ partial, isLastDraw, useFrame });
        });
    }

    add(item) {
        this.children.push(item);
    }

    inzializeStagger() {
        this.children.forEach((item) => {
            item.inzializeStagger();
        });
    }

    setDuration(val) {
        this.children.forEach((item) => {
            item.setDuration(val);
        });
    }

    getDuration() {
        return this.children.length > 0 ? this.children[0].getDuration() : 0;
    }

    setStretchFactor(val) {
        this.children.forEach((item) => {
            item.setStretchFactor(val);
        });
    }

    getLabels() {
        return this.children.map((item) => item.getLabels()).flat();
    }

    resetLastValue() {
        this.children.forEach((item) => item.resetLastValue());
    }

    disableStagger() {
        this.children.forEach((item) => {
            item.disableStagger();
        });
    }

    cleanCachedId() {
        this.children.forEach((item) => {
            item.cleanCachedId();
        });
    }

    getType() {
        return this.type;
    }

    destroy() {
        this.children.forEach((item) => {
            item.destroy();
        });
        this.children = [];
    }
}
