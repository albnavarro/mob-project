export const tUtils = {
  getAlignFormObject({ position, offset, dimension }) {
    if (position < offset) {
      return "BEFORE";
    } else if (position >= offset && position <= offset + dimension) {
      return "INNER";
    } else if (position > offset + dimension) {
      return "AFTER";
    }
  },

  getDifferenceValue(align) {
    return ({ position, offset, dimension }) => {
      switch (align) {
        case "BEFORE":
          return Math.abs(offset - position);

        case "AFTER":
          return Math.abs(position - (offset + dimension));

        default:
          return 0;
      }
    };
  },

  clampMinimumDelta(delta, minVal) {
    return delta < minVal ? minVal : delta;
  },

  isOverlap(xData, yData) {
    return (
      this.getAlignFormObject(xData) === "INNER" &&
      this.getAlignFormObject(yData) === "INNER"
    );
  },

  getPropiertiesValue(intersect) {
    return ({ delta, maxVal, minVal, maxDistance }) => {
      return intersect
        ? maxVal
        : ((maxVal - minVal) * delta) / maxDistance + minVal;
    };
  },

  getClampedPropiesties(invert, val, maxVal, minVal) {
    return invert ? maxVal - val + minVal : val;
  },
};
