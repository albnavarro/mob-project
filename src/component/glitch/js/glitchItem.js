import { requestInterval } from '../../../js/utility/setInterval.js';
import { mq } from '../../../js/core/utils/mediaManager.js';
import { forceRedraw } from '../../../js/utility/redrowNode.js';
import { detectSafari } from '../../../js/utility/isSafari.js';

export class GlitchItemClass {
    constructor(data) {
        this.item = data.item;
        this.steptime = parseInt(data.steptime);
        this.duration = parseInt(data.duration);
        this.velocity = parseFloat(data.velocity);
        this.baseFrequency = parseFloat(data.baseFrequency);
        this.counter = parseInt(data.counter);
        this.loop = data.loop;
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
        this.turbolenceEl = null;
        this.raf = null;
        this.interval = null;
        this.start = 0;
        this.progress = 0;
    }

    init() {
        this.inzializeSvg();

        setTimeout(() => {
            this.redRawItem();
        }, 100);
    }

    redRawItem() {
        if (detectSafari()) {
            forceRedraw(this.item);
        }
    }

    inzializeSvg() {
        if (!mq[this.queryType](this.breackpoint)) return;

        // Create svg filter element
        const div = document.createElement('div');
        div.style.height = '0px';
        div.style.overflow = 'hidden';

        const svg = `<svg viewBox="0 0 0 0" class="glitch-svg glitch-svg-${this.counter}">
            <filter id="glitchNoise${this.counter}" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0 0" type="fractalNoise" result="NOISE" numOctaves="2"/>
                    <feColorMatrix type="hueRotate" values="0">
                        <animate
                            attributeName="values"
                            from="0"
                            to="360"
                            dur="${this.velocity}s"
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
                <feDisplacementMap in="SourceGraphic" scale="20"/>
            </filter>
        </svg>`;

        div.innerHTML = svg.trim();
        document.body.appendChild(div);
        this.turbolenceEl = document.querySelector(
            `.glitch-svg-${this.counter} feTurbulence`
        );

        // Apply filter url to element
        const style = {
            filter: `url(#glitchNoise${this.counter})`,
            transform: 'translate3D(0, 0, 0)',
        };
        Object.assign(this.item.style, style);

        const startAnimate = () => {
            this.turbolenceEl.setAttribute(
                'baseFrequency',
                `0 ${this.baseFrequency}`
            );
        };

        const startRaf = () => {
            startAnimate();
            this.raf = requestAnimationFrame(loop);
        };

        if (this.loop) {
            startAnimate();
        } else {
            requestInterval(startRaf, this.steptime);
        }

        const loop = (timestamp) => {
            if (!this.start) this.start = timestamp;
            this.progress = timestamp - this.start;

            if (this.progress < this.duration) {
                this.raf = requestAnimationFrame(loop);
            } else {
                this.start = 0;
                this.progress = 0;
                this.turbolenceEl.setAttribute('baseFrequency', `0 0`);
                cancelAnimationFrame(this.raf);
                this.raf = null;
            }
        };
    }
}
