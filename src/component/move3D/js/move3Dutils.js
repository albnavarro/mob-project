export const move3DUtils = {
  getRotate({ startRotation, range, delta, limit }) {
    return ((range * delta) / limit - startRotation).toFixed(2);
  },

  getRotateFromPosition({
    rotate,
    anchorPoint,
    baseRotateX,
    baseRotateY,
    item,
  }) {
    if (!rotate || !anchorPoint)
      return {
        rotateX: 0,
        rotateY: 0,
      };

    switch (rotate.toUpperCase()) {
      case "X":
        return (() => {
          switch (anchorPoint.toUpperCase()) {
            case "BOTTOM":
              Object.assign(item.style, {
                "transform-origin": "bottom",
              });
              return {
                rotateX: baseRotateX,
                rotateY: 0,
              };

            case "TOP":
              Object.assign(item.style, { "transform-origin": "top" });
              return {
                rotateX: -baseRotateX,
                rotateY: 0,
              };

            default:
              return {
                rotateX: 0,
                rotateY: 0,
              };
          }
        })();

      case "Y":
        return (() => {
          switch (anchorPoint.toUpperCase()) {
            case "LEFT":
              Object.assign(item.style, { "transform-origin": "left" });
              return {
                rotateX: 0,
                rotateY: baseRotateY,
              };

            case "RIGHT":
              Object.assign(item.style, { "transform-origin": "right" });
              return {
                rotateX: 0,
                rotateY: -baseRotateY,
              };

            default:
              return {
                rotateX: 0,
                rotateY: 0,
              };
          }
        })();

      case "XY":
        return (() => {
          switch (anchorPoint.toUpperCase()) {
            case "TOP-LEFT":
              Object.assign(item.style, {
                "transform-origin": "top left",
              });
              return {
                rotateX: -baseRotateX,
                rotateY: baseRotateY,
              };

            case "TOP-RIGHT":
              Object.assign(item.style, {
                "transform-origin": "top right",
              });
              return {
                rotateX: -baseRotateX,
                rotateY: -baseRotateY,
              };

            case "BOTTOM-LEFT":
              Object.assign(item.style, {
                "transform-origin": "bottom left",
              });
              return {
                rotateX: baseRotateX,
                rotateY: baseRotateY,
              };

            case "BOTTOM-RIGHT":
              Object.assign(item.style, {
                "transform-origin": "bottom right",
              });
              return {
                rotateX: baseRotateX,
                rotateY: -baseRotateY,
              };

            default:
              return {
                rotateX: 0,
                rotateY: 0,
              };
          }
        })();

      default:
        return {
          rotateX: 0,
          rotateY: 0,
        };
    }
  },
};
