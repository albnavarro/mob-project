import { move3DUtils } from './move3Dutils.js';

export class move3DitemClass {
    constructor(data) {
        this.item = data.item;
        this.depth = data.depth;
        this.rotate = data.rotate;
        this.anchorPoint = data.anchorPoint;
        this.range = data.range;
        this.initialRotate = data.initialRotate;
        this.animate = data.animate;

        this.endValue = { depth: 0, rotateX: 0, rotateY: 0 };
        this.startValue = { depth: 0, rotateX: 0, rotateY: 0 };
        this.smooth = 10;
        this.prevValue = 0;
        this.rafOnScroll = null;
    }

    init() {
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

        this.endValue = { depth, rotateX, rotateY };

        if (!this.rafOnScroll)
            this.rafOnScroll = requestAnimationFrame(
                this.onReuqestAnimScroll.bind(this)
            );
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            // console.log('tick');

            this.prevValue = { ...this.startValue };

            const { depth, rotateX, rotateY } = (() => {
                const v = this.smooth;
                const {
                    depth: depthStart,
                    rotateX: rotateXStart,
                    rotateY: rotateYStart,
                } = this.startValue;
                const {
                    depth: depthEnd,
                    rotateX: rotateXEnd,
                    rotateY: rotateYEnd,
                } = this.endValue;

                const depth = (depthEnd - depthStart) / v + depthStart * 1;
                const rotateX =
                    (rotateXEnd - rotateXStart) / v + rotateXStart * 1;
                const rotateY =
                    (rotateYEnd - rotateYStart) / v + rotateYStart * 1;

                return {
                    depth: depth.toFixed(1),
                    rotateX: rotateX.toFixed(1),
                    rotateY: rotateY.toFixed(1),
                };
            })();

            this.startValue = { depth, rotateX, rotateY };
            const {
                depth: depthPrev,
                rotateX: axPrev,
                rotateY: ayPrev,
            } = this.prevValue;

            this.item.style.transform = `translate3D(0,0,${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            if (depth == depthPrev && rotateX == axPrev && rotateY == ayPrev) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
