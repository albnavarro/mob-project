import { requestInterval } from '../../../js/utility/setInterval.js';
import { mq } from '../../../js/base/mediaManager.js';

export class GlitchItemClass {
    constructor(data) {
        this.item = data.item;
        this.steptime = parseInt(data.steptime);
        this.duration = parseInt(data.duration);
        this.counter = parseInt(data.counter)
        this.increase = parseFloat(data.increase);
        this.multiplier = parseFloat(data.multiplier);
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
        this.turbolenceEl = null;
        this.baseFrequency = 0.00001;
        this.frequency = 0.00001;
        this.raf = null;
        this.interval = null;
        this.start = 0;
        this.progress = 0;
    }

    init() {
        // Create svg filter element
        const div = document.createElement('div');
        const svg = `<svg viewBox="0 0 0 0" class="glitch-svg glitch-svg-${this.counter}">
            <filter id="noise${this.counter}" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0 0" result="NOISE" numOctaves="2"></feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="30" xChannelSelector="R" yChannelSelector="R"></feDisplacementMap>
            </filter>
        </svg>`;

        div.innerHTML = svg.trim();
        div.style.height = '0px';
        div.style.overflow = 'hidden';
        document.body.appendChild(div);
        this.turbolenceEl = document.querySelector(`.glitch-svg-${this.counter} #noise${this.counter} feTurbulence`);

        // Apply filter url to element
        const style = {
            filter: `url(#noise${this.counter})`
        }
        Object.assign(this.item.style, style);

        // start animation every this.steptime value
        setInterval(() => {
            if (!mq[this.queryType](this.breackpoint)) return;

            this.raf = requestAnimationFrame(loop);
        }, this.steptime)

        const loop = (timestamp) => {
          if (!this.start) this.start = timestamp;
          this.progress = timestamp - this.start;

          if (this.progress < this.duration) {
                const baseFrequency = Math.sin(this.frequency * this.multiplier);
                this.turbolenceEl.setAttribute('baseFrequency', `0 ${baseFrequency}`)
                this.frequency += this.increase;
                this.raf = requestAnimationFrame(loop);

            } else {
                this.start = 0;
                this.progress = 0;
                this.frequency = this.baseFrequency;
                this.turbolenceEl.setAttribute('baseFrequency', `0 0`)
                cancelAnimationFrame(this.raf);
                this.raf = null;
            }
        }
    }
}
