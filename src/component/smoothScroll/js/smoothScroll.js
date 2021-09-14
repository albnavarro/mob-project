import { eventManager } from "../../../js/base/eventManager.js";
import { normalizeWheel } from "./normalizeWhell.js";

class SmoothScrollClass {
  constructor() {
    this.target = document.documentElement;
    this.endValue = window.pageYOffset;
    this.speed = 60;
    this.smooth = 10;
    this.startValue = 0;
    this.endValue = 0;
    this.prevValue = 0;
    this.rafOnScroll = null;
  }

  init() {
    eventManager.push("scrollStart", () => this.reset(), 10);
    eventManager.push("scrollEnd", () => this.reset(), 10);
    this.target.addEventListener("wheel", (e) => this.onScroll(e), {
      passive: false,
    });

    // TODO: is necessary ?
    this.target.addEventListener("DOMMouseScroll", (e) => this.onScroll(e), {
      passive: false,
    });
  }

  reset() {
    this.startValue = window.pageYOffset;
    this.endValue = window.pageYOffset;
    this.prevValue = window.pageYOffset;
    this.rafOnScroll = null;
  }

  onScroll(e) {
    // Prevent scroll with body in overflow = hidden;
    const bodyIsOverflow = document.body.style.overflow === "hidden";
    if (bodyIsOverflow) return;

    // If wheelDelta or wheelDeltaY is not supported return
    if (!("wheelDelta" in e) || !("wheelDeltaY" in e)) return;

    e.preventDefault();

    // Simple solution
    // const spinY = ((e) => {
    //     if (!e) {
    //         e = window.event;
    //     }
    //     const w = e.wheelDelta;
    //     const d = e.detail;
    //     if (d) {
    //         return -d / 3; // Firefox;
    //     }
    //
    //     console.log(d)
    //     // IE, Safari, Chrome & other browsers
    //     return -(w / 120);
    // })(e);

    // Facebook normalize whell code
    const { spinY } = normalizeWheel(e);

    this.endValue += spinY * this.speed;
    this.endValue = Math.max(
      0,
      Math.min(
        this.endValue,
        this.target.scrollHeight - this.target.clientHeight
      )
    ); // limit scrolling

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
        v = this.smooth,
        val = (f - s) / v + s * 1;

      this.startValue = val.toFixed(1);
      this.target.scrollTop = this.startValue;

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
}

export const smoothScroll = new SmoothScrollClass();
