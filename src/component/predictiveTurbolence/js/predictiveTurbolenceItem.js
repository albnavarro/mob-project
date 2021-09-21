import { mouseManager } from '../../../js/base/mouseManager.js';
import { eventManager } from '../../../js/base/eventManager.js';
import { mq } from '../../../js/base/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';

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
        this.scale = parseInt(data.scale);
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
        this.invert = data.invert;
        this.turbolenceEl = null;
        this.offsetY = 0;
        this.offsetX = 0;
        this.width = 0;
        this.height = 0;
    }

    init() {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.inzializeSvg();
        this.onResize();
        mouseManager.push('mousemove', () => this.onMove());
        eventManager.push('resize', () => this.onResize());

        // SAFARI MALEDETTO
        document.body.style.height = '0px';
        document.body.style.height = '';
    }

    inzializeSvg() {
        // Create svg filter element
        const div = document.createElement('div');
        div.style.height = '0px';
        div.style.overflow = 'hidden';

        const svg = `<svg viewBox="0 0 0 0" class="predictiveTurbolence-svg predictiveTurbolence-svg-${this.counter}">
            <filter id="predictiveTurbolence${this.counter}">
                <feTurbulence baseFrequency="${this.maxFrequency}" type="turbulence" result="NOISE" numOctaves="2"/>
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
        document.body.appendChild(div);
        this.turbolenceEl = document.querySelector(`.predictiveTurbolence-svg-${this.counter} feTurbulence`);

        // Apply filter url to element
        const style = {
            filter: `url(#predictiveTurbolence${this.counter})`
        }
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
            if(x < this.offsetX) {
                return 'LEFT'
            } else if (x >= this.offsetX && x <= this.offsetX + this.width) {
                return 'INNERX'
            } else if (x > this.offsetX + this.width) {
                return 'RIGHT'
            }
        })()

        const positionY = (() => {
            if(y < this.offsetY) {
                return 'TOP'
            } else if (y >= this.offsetY && y <= this.offsetY + this.height) {
                return 'INNERY'
            } else if (y > this.offsetY + this.height) {
                return 'BOTTOM'
            }
        })()

        const isOver = (() => {
            return (positionX == 'INNERX' && positionY =='INNERY')
        })()

        const gapX = (() => {
            if( positionX === 'LEFT' ) {
                return Math.abs(this.offsetX - x);
            } else if ( positionX === 'RIGHT') {
                return Math.abs(x - (this.offsetX + this.width));
            } else {
                return 1;
            }
        })()

        const gapY = (() => {
            if( positionY === 'TOP' ) {
                return Math.abs((this.offsetY - y));
            } else if ( positionY === 'BOTTOM') {
                return Math.abs(y - (this.offsetY + this.height));
            }  else {
                return 1;
            }
        })()

        const delta = Math.sqrt(
            Math.pow(Math.abs(gapY), 2) + Math.pow(Math.abs(gapX), 2)
        );

        const deltaInvert = this.maxDistance - delta;
        const deltaFiltered = (deltaInvert < this.minFrequency) ? this.minFrequency : deltaInvert;


        // maxFrequency : x = maxDistance : delta
        const baseFrequency = (() => {
            if(isOver) {
                return this.maxFrequency;
            } else {
                return (((this.maxFrequency - this.minFrequency)  * deltaFiltered) / this.maxDistance) + this.minFrequency;
            }
        })();

        // const pippo = (baseFrequency * this.maxFrequency) / this.minFrequency;
        console.log(baseFrequency)

        const baseFrequencyFiltered =
            (this.invert)
                ? (this.maxFrequency - baseFrequency) + this.minFrequency
                : baseFrequency;


        this.turbolenceEl.setAttribute('baseFrequency', `${baseFrequencyFiltered}`);
    }
}
