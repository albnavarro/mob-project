export class HandleMasterSequencer {
    constructor() {
        this.type = 'sequencer';
        this.children = [];
    }

    draw({ partial, isLastDraw, useFrame }) {
        this.children.forEach((item, i) => {
            item.draw({ partial, isLastDraw, useFrame });
        });
    }

    add(item) {
        this.children.push(item);
    }

    setDuration(val) {
        this.children.forEach((item, i) => {
            item.setDuration(val);
        });
    }

    getDuration() {
        return this.children.length > 0 ? this.children[0].getDuration() : 0;
    }

    disableStagger() {
        this.children.forEach((item, i) => {
            item.disableStagger();
        });
    }

    getType() {
        return this.type;
    }

    destroy() {
        this.children = [];
    }
}
