import { eventManager } from "../../../js/base/eventManager.js";
import { mq } from "../../../js/base/mediaManager.js";
import {
  outerHeight,
  outerWidth,
  offset,
} from "../../../js/utility/vanillaFunction.js";

export class PageScrollItemClass {
  constructor(data) {
    this.root = data.item;
    this.content = data.item.querySelector(".pageScroller__content");
    this.shadow = data.item.querySelector(".pageScroller__shadow");
    this.speed = data.speed;
    this.breackpoint = data.breackpoint;
    this.queryType = data.queryType;
    this.offsetTop = 0;
    this.rafOnScroll = null;
    this.startValue = 0;
    this.endValue = 0;
    this.prevValue = 0;
  }

  init() {
    eventManager.push("load", () => this.setShadow());
    eventManager.push("load", () => this.setOffset());
    eventManager.push("load", () => this.setContent());
    eventManager.push("resize", () => this.setShadow());
    eventManager.push("resize", () => this.setOffset());
    eventManager.push("resize", () => this.setContent());
    eventManager.push("scroll", () => this.onScroll());
  }

  setShadow() {
    const width = outerWidth(this.content);
    const height = outerHeight(this.content);

    const style = mq[this.queryType](this.breackpoint)
      ? {
          width: `${width}px`,
          height: `${height}px`,
        }
      : {
          width: "0px",
          height: "0px",
        };

    Object.assign(this.shadow.style, style);

    // hide cotent to avoid bad calcultation on resize
    this.content.style.display = "none";
  }

  setOffset() {
    this.offsetTop = offset(this.shadow).top;
  }

  setContent() {
    this.setOffset();
    this.endValue = eventManager.scrollTop() - this.offsetTop;
    this.startValue = this.endValue;

    const style = mq[this.queryType](this.breackpoint)
      ? {
          transform: `translateY(${-this.endValue}px)`,
          position: `fixed`,
          top: `0`,
          left: `0`,
          right: `0`,
          display: `block`,
        }
      : {
          transform: "translateY(0)",
          position: "static",
          top: `0`,
          left: `0`,
          right: `0`,
          display: `block`,
        };

    Object.assign(this.content.style, style);
  }

  onScroll() {
    if (!mq[this.queryType](this.breackpoint)) return;
    this.endValue = eventManager.scrollTop() - this.offsetTop;

    if (!this.rafOnScroll)
      this.rafOnScroll = requestAnimationFrame(
        this.onReuqestAnimScroll.bind(this)
      );
  }

  onReuqestAnimScroll(timeStamp) {
    const draw = (timeStamp) => {
      this.prevValue = this.startValue;

      const s = this.startValue,
        f = this.endValue,
        v = this.speed,
        val = (f - s) / v + s * 1;

      this.startValue = val.toFixed(1);

      const style = mq[this.queryType](this.breackpoint)
        ? {
            transform: `translateY(${-this.startValue}px)`,
          }
        : {
            transform: "translateY(0)",
          };

      Object.assign(this.content.style, style);

      // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
      if (this.prevValue == this.startValue) {
        cancelAnimationFrame(this.rafOnScroll);
        this.rafOnScroll = null;
        return;
      }

      this.rafOnScroll = requestAnimationFrame(draw);
    };

    draw(timeStamp);
  }

  refresh() {
    this.setShadow();
    this.onEnter();
  }
}
