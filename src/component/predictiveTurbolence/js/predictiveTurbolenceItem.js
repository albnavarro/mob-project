import { mouseManager } from "../../../js/base/mouseManager.js";
import { eventManager } from "../../../js/base/eventManager.js";
import { mq } from "../../../js/base/mediaManager.js";
import {
  outerHeight,
  outerWidth,
  offset,
} from "../../../js/utility/vanillaFunction.js";
import { forceRedraw } from '../../../js/utility/redrowNode.js';
import { detectSafari } from '../../../js/utility/isSafari.js';

export class PredictiveTurbolenceItemClass {
  constructor(data) {
    this.item = data.item;
    this.steptime = parseInt(data.steptime);
    this.duration = parseInt(data.duration);
    this.counter = parseInt(data.counter);
    this.maxDistance = parseInt(data.maxDistance);
    this.maxFrequency = parseFloat(data.maxFrequency);
    this.minFrequency = parseFloat(data.minFrequency);
    this.duration = parseFloat(data.duration);
    this.maxScale = parseInt(data.maxScale);
    this.minScale = parseInt(data.minScale);
    this.breackpoint = data.breackpoint;
    this.queryType = data.queryType;
    this.invert = data.invert;
    this.turbolenceEl = null;
    this.displacementMap = null;
    this.offsetY = 0;
    this.offsetX = 0;
    this.width = 0;
    this.height = 0;
  }

  init() {
    if (!mq[this.queryType](this.breackpoint)) return;

    this.inzializeSvg();
    this.onResize();
    mouseManager.push("mousemove", () => this.onMove());
    mouseManager.push("scroll", () => this.onMove());
    eventManager.push("resize", () => this.onResize());

    setTimeout(() => {
        this.redRawItem();
    }, 100)

  }

  redRawItem() {
      if(detectSafari()) {
          forceRedraw(this.item);
      }
  }

  inzializeSvg() {
    // Create svg filter element
    const div = document.createElement("div");
    div.style.height = "0px";
    div.style.overflow = "hidden";


    // https://medium.com/@codebro/svg-noise-filter-bc6247ba4399
    //
    // Hue Rotate
    // This allows us to smoothly and continuously change our rainbow colors through a full spectrum of color.
    //
    // Color Matrix
    // While cycling through our color spectrum we will want to isolate a single
    // color in order to access and apply our noise.
    //
    // 1 - Nest our color matrix inside our filters under our turbulence.
    //
    // 2 - Nest our animation inside our color matrix. Setting repeatCount to indefinite will create a continuous loop.
    //  You will notice the rainbow colors changing.
    //
    // 3 - Add our second color matrix to isolate a color channel.
    //  We only need the alpha value of either the R, G or B channels to be present.
    //
    const svg = `<svg viewBox="0 0 0 0" class="predictiveTurbolence-svg predictiveTurbolence-svg-${this.counter}">
            <filter id="predictiveTurbolence${this.counter}">
                <feTurbulence baseFrequency="${this.minFrequency}" type="fractalNoise" result="NOISE" numOctaves="2"/>
                <feColorMatrix type="hueRotate" values="0">
                    <animate
                        attributeName="values"
                        from="0"
                        to="360"
                        dur="${this.duration}s"
                        repeatCount="indefinite"
                    />
                </feColorMatrix>
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0
                           0 0 0 0 0
                           0 0 0 0 0
                           1 0 0 0 0"
                />
                <feDisplacementMap in="SourceGraphic" scale="${this.minScale}"/>
            </filter>
    </svg>`;

    div.innerHTML = svg.trim();
    document.body.appendChild(div);
    this.turbolenceEl = document.querySelector(
      `.predictiveTurbolence-svg-${this.counter} feTurbulence`
    );

    this.displacementMap = document.querySelector(
      `.predictiveTurbolence-svg-${this.counter} feDisplacementMap`
    );

    // Apply filter url to element
    const style = {
      filter: `url(#predictiveTurbolence${this.counter})`,
      transform: 'translate3D(0, 0, 0)',
    };
    Object.assign(this.item.style, style);
  }

  onResize() {
    this.offsetY = offset(this.item).top;
    this.offsetX = offset(this.item).left;
    this.width = outerWidth(this.item);
    this.height = outerHeight(this.item);
  }

  onMove() {
    const x = mouseManager.pageX();
    const y = mouseManager.pageY();

    const positionX = (() => {
      if (x < this.offsetX) {
        return "LEFT";
      } else if (x >= this.offsetX && x <= this.offsetX + this.width) {
        return "INNERX";
      } else if (x > this.offsetX + this.width) {
        return "RIGHT";
      }
    })();

    const positionY = (() => {
      if (y < this.offsetY) {
        return "TOP";
      } else if (y >= this.offsetY && y <= this.offsetY + this.height) {
        return "INNERY";
      } else if (y > this.offsetY + this.height) {
        return "BOTTOM";
      }
    })();

    const isOver = (() => {
      return positionX == "INNERX" && positionY == "INNERY";
    })();

    const gapX = (() => {
      if (positionX === "LEFT") {
        return Math.abs(this.offsetX - x);
      } else if (positionX === "RIGHT") {
        return Math.abs(x - (this.offsetX + this.width));
      } else {
        return 1;
      }
    })();

    const gapY = (() => {
      if (positionY === "TOP") {
        return Math.abs(this.offsetY - y);
      } else if (positionY === "BOTTOM") {
        return Math.abs(y - (this.offsetY + this.height));
      } else {
        return 1;
      }
    })();

    const delta = Math.sqrt(
      Math.pow(Math.abs(gapY), 2) + Math.pow(Math.abs(gapX), 2)
    );

    const deltaInvert = this.maxDistance - delta;

    const deltaFiltered =
      deltaInvert < this.minFrequency ? this.minFrequency : deltaInvert;

    const scaleFiltered =
      deltaInvert < this.minScale ? this.minScale : deltaInvert;

    // maxFrequency : x = maxDistance : delta
    const baseFrequency = (() => {
      if (isOver) {
        return this.maxFrequency;
      } else {
        return (
          ((this.maxFrequency - this.minFrequency) * deltaFiltered) /
            this.maxDistance +
          this.minFrequency
        );
      }
    })();

    const scale = (() => {
      if (isOver) {
        return this.maxScale;
      } else {
        return (
          ((this.maxScale - this.minScale) * scaleFiltered) / this.maxDistance +
          this.minScale
        );
      }
    })();

    const baseFrequencyFinal = this.invert
      ? this.maxFrequency - baseFrequency + this.minFrequency
      : baseFrequency;

    const scaleFinal = this.invert
      ? this.maxScale - scale + this.minScale
      : scale;

    this.turbolenceEl.setAttribute("baseFrequency", `${baseFrequencyFinal}`);
    this.displacementMap.setAttribute("scale", `${scaleFinal}`);
  }
}
