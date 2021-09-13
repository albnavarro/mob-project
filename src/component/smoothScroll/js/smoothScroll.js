import { eventManager } from "../../../js/base/eventManager.js";

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
        eventManager.push('scrollStart', () => this.reset(), 10)
        eventManager.push('scrollEnd', () => this.reset(), 10)
        this.target.addEventListener('wheel', (e) => this.onScroll(e), { passive: false })
    }

    reset() {
        this.startValue = window.pageYOffset;
        this.endValue = window.pageYOffset;
        this.prevValue = window.pageYOffset;
        this.rafOnScroll = null;
    }

    onScroll(e) {
        e.preventDefault();

        // Prevent scroll with body in overflow = hidden;
        const bodyIsOverflow = document.body.style.overflow === 'hidden'
        if (bodyIsOverflow) return;

        const normalizeWheelDelta = (e) => {
            if(e.detail){
                if(e.wheelDelta) {
                    return e.wheelDelta/e.detail/40 * (e.detail>0 ? 1 : -1) // Opera
                } else {
                    return -e.detail/1.5 // Firefox
                }
            } else {
                return e.wheelDelta/120 // IE,Safari,Chrome
            }
        }

        const delta = normalizeWheelDelta(e)
        this.endValue += -delta * this.speed
        this.endValue = Math.max(0, Math.min(this.endValue, this.target.scrollHeight - this.target.clientHeight)) // limit scrolling

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
        this.target.scrollTop = this.startValue

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
