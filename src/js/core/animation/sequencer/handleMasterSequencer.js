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

    disableStagger() {
        this.children.forEach((item) => {
            item.disableStagger();
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
