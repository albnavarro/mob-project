import { mq } from '../../../js/core';
import { forceRedraw } from '../../../js/utility/redrowNode.js';
import { detectSafari } from '../../../js/utility/isSafari.js';

export class WaveItemClass {
    constructor(data) {
        this.item = data.item;
        this.steptime = parseInt(data.steptime);
        this.duration = parseInt(data.duration);
        this.counter = parseInt(data.counter);
        this.baseFrequency = parseFloat(data.baseFrequency);
        this.duration = parseFloat(data.duration);
        this.scale = parseInt(data.scale);
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
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
        const svg = `<svg viewBox="0 0 0 0" class="wave-svg">
            <filter id="wave${this.counter}">
                <feTurbulence baseFrequency="${this.baseFrequency}" type="fractalNoise" result="NOISE" numOctaves="2"/>
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
                <feDisplacementMap in="SourceGraphic" scale="${this.scale}"/>
            </filter>
        </svg>`;

        div.innerHTML = svg.trim();
        div.style.height = '0px';
        div.style.overflow = 'hidden';
        document.body.appendChild(div);

        // Apply filter url to element
        const style = {
            filter: `url(#wave${this.counter})`,
            transform: 'translate3D(0, 0, 0)',
        };
        Object.assign(this.item.style, style);
    }
}
