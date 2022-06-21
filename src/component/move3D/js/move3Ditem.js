import { move3DUtils } from './move3Dutils.js';
import { mobbu } from '.../../../js/core';

export class move3DitemClass {
    constructor(data) {
        this.item = data.item;
        this.depth = data.depth;
        this.rotate = data.rotate;
        this.anchorPoint = data.anchorPoint;
        this.range = data.range;
        this.initialRotate = data.initialRotate;
        this.animate = data.animate;
        this.lerp = mobbu.create('lerp');
        this.unsubscribelerp = () => {};
        this.unsubscribeOnComplete = () => {};
    }

    init() {
        this.lerp.setData({ depth: 0, rotateX: 0, rotateY: 0 });

        this.unsubscribelerp = this.lerp.subscribe(
            ({ depth, rotateX, rotateY }) => {
                this.item.style.transform = `translate3D(0,0,${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        );

        this.unsubscribeOnComplete = this.lerp.onComplete(
            ({ depth, rotateX, rotateY }) => {
                this.item.style.transform = `translateZ(${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        );

        if (!this.animate) {
            const style = {
                transform: `translateZ(${this.depth}px)`,
            };
            Object.assign(this.item.style, style);
        }
    }

    move(delta, limit) {
        const depth = parseInt((this.depth * delta) / limit);
        const getRotateData = {
            startRotation: this.initialRotate,
            range: this.range,
            delta: delta,
            limit: limit,
        };
        const baseRotateX = move3DUtils.getRotate(getRotateData);
        const baseRotateY = move3DUtils.getRotate(getRotateData);

        const getRotateFromPositionData = {
            rotate: this.rotate,
            anchorPoint: this.anchorPoint,
            item: this.item,
            baseRotateX,
            baseRotateY,
        };
        const { rotateX, rotateY } = move3DUtils.getRotateFromPosition(
            getRotateFromPositionData
        );

        this.lerp.goTo({ depth, rotateX, rotateY }).catch((err) => {});
    }

    destroy() {
        this.unsubscribelerp();
        this.unsubscribeOnComplete();
        this.lerp = null;
    }
}
