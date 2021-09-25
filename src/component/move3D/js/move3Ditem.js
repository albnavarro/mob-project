export class move3DitemClass {
  constructor(data) {
    this.item = data.item;
    this.container = data.container;
    this.depth = data.depth;
    // additional rotate
    this.rotate = data.rotate;
    this.direction = data.direction;
    this.range = data.range;
    this.initialRotate = data.initialRotate;
    //
    this.animate = data.animate;
    this.width = 0;
  }

  init() {
    if (!this.animate) {
      const style = {
        transform: `translateZ(${this.depth}px)`,
      };
      Object.assign(this.item.style, style);
    }
  }

  getRotate(range, delta, limit) {
    return ((range * delta) / limit - this.initialRotate).toFixed(2);
  }

  move(delta, limit) {
    let depth = this.depth;
    depth = parseInt((this.depth * delta) / limit);

    let rotateX = 0;
    let rotateY = 0;

    // X rotate
    switch (this.rotate) {
      case "x":
        rotateX = this.getRotate(this.range, delta, limit);

        switch (this.direction) {
          case "bottom":
            Object.assign(this.item.style, { "transform-origin": "top" });
            rotateX = -rotateX;
            break;

          case "top":
            Object.assign(this.item.style, { "transform-origin": "bottom" });
            break;
        }
        break;

      case "y":
        rotateY = this.getRotate(this.range, delta, limit);

        switch (this.direction) {
          case "left":
            Object.assign(this.item.style, { "transform-origin": "right" });
            rotateY = -rotateY;
            break;

          case "right":
            Object.assign(this.item.style, { "transform-origin": "left" });
            break;
        }
        break;

      case "xy":
        rotateY = this.getRotate(this.range, delta, limit);
        rotateX = this.getRotate(this.range, delta, limit);

        switch (this.direction) {
          case "top-left":
            Object.assign(this.item.style, {
              "transform-origin": "bottom right",
            });
            rotateY = -rotateY;
            break;

          case "top-right":
            Object.assign(this.item.style, {
              "transform-origin": "bottom left",
            });
            break;

          case "bottom-left":
            Object.assign(this.item.style, { "transform-origin": "top right" });
            rotateY = -rotateY;
            rotateX = -rotateX;
            break;

          case "bottom-right":
            Object.assign(this.item.style, { "transform-origin": "top left" });
            rotateX = -rotateX;
            break;
        }
        break;
    }

    const style = {
      transform: `translate3D(0,0,${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };

    Object.assign(this.item.style, style);
  }
}
