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

    getDuration() {
        return this.children.length > 0 ? this.children[0].getDuration() : 0;
    }

    getType() {
        return this.type;
    }

    destroy() {
        this.children = [];
    }
}
