import { move3DUtils } from "./move3Dutils.js";

export class move3DitemClass {
  constructor(data) {
    this.item = data.item;
    this.depth = data.depth;
    this.rotate = data.rotate;
    this.anchorPoint = data.anchorPoint;
    this.range = data.range;
    this.initialRotate = data.initialRotate;
    this.animate = data.animate;
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

    const style = {
      transform: `translate3D(0,0,${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };

    Object.assign(this.item.style, style);
  }
}
