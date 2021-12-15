import { mouseManager } from '../../../js/base/mouseManager.js';
import { eventManager } from '../../../js/base/eventManager.js';
import { mq } from '../../../js/base/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';
import { forceRedraw } from '../../../js/utility/redrowNode.js';
import { detectSafari } from '../../../js/utility/isSafari.js';
import { tUtils } from './predictiveTurbolenceUtils.js';
import { SimpleStore } from '../../../js/utility/simpleStore.js';
import { useSpring } from '.../../../js/animation/spring/useSpring.js';
import { springConfig } from '.../../../js/animation/spring/springConfig.js';

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
        this.spring = new useSpring();
        this.spring.seData({ baseFrequency: 0, scale: 0 });

        this.store = new SimpleStore({
            turbolenceEl: null,
            displacementMap: null,
            offsetY: 0,
            offsetX: 0,
            width: 0,
            height: 0,
        });

        Object.freeze(this);
    }

    init() {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.spring.updateConfig(springConfig.linear);

        this.inzializeSvg();
        this.onResize();
        mouseManager.push('mousemove', () => this.onMove());
        mouseManager.push('scroll', () => this.onMove());
        eventManager.push('resize', () => this.onResize());

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
        // Create svg filter element
        const div = document.createElement('div');
        div.style.height = '0px';
        div.style.overflow = 'hidden';

        // https://medium.com/@codebro/svg-noise-filter-bc6247ba4399
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

        const turbolenceEl = document.querySelector(
            `.predictiveTurbolence-svg-${this.counter} feTurbulence`
        );
        this.store.setProp('turbolenceEl', turbolenceEl);

        const displacementMap = document.querySelector(
            `.predictiveTurbolence-svg-${this.counter} feDisplacementMap`
        );
        this.store.setProp('displacementMap', displacementMap);

        // Apply filter url to element
        const style = {
            filter: `url(#predictiveTurbolence${this.counter})`,
            transform: 'translate3D(0, 0, 0)',
        };

        Object.assign(this.item.style, style);
    }

    onResize() {
        const item = this.item;

        this.store.setProp('offsetY', offset(item).top);
        this.store.setProp('offsetX', offset(item).left);
        this.store.setProp('width', outerWidth(item));
        this.store.setProp('height', outerHeight(item));
    }

    onMove() {
        const x = mouseManager.pageX();
        const y = mouseManager.pageY();
        const offsetX = this.store.getProp('offsetX');
        const offsetY = this.store.getProp('offsetY');
        const width = this.store.getProp('width');
        const height = this.store.getProp('height');

        // Define axsis data
        const xData = {
            position: x,
            offset: offsetX,
            dimension: width,
        };

        const yData = {
            position: y,
            offset: offsetY,
            dimension: height,
        };

        // Get position form object
        const horizontalGap = tUtils.getDifferenceValue(
            tUtils.getAlignFormObject(xData)
        )(xData);

        const vertialGap = tUtils.getDifferenceValue(
            tUtils.getAlignFormObject(yData)
        )(yData);

        // Get ipotenusa from cateti = dalta val
        const delta = Math.sqrt(
            Math.pow(Math.abs(vertialGap), 2) +
                Math.pow(Math.abs(horizontalGap), 2)
        );

        // Invert delta alue
        const deltaInvert = this.maxDistance - delta;

        // Calculate propieries value frequency and scale
        const baseFrequencyData = {
            delta: tUtils.clampMinimumDelta(deltaInvert, this.minFrequency),
            maxVal: this.maxFrequency,
            minVal: this.minFrequency,
            maxDistance: this.maxDistance,
        };

        const baseScaleData = {
            delta: tUtils.clampMinimumDelta(deltaInvert, this.minScale),
            maxVal: this.maxScale,
            minVal: this.minScale,
            maxDistance: this.maxDistance,
        };

        const baseFrequency = tUtils.getPropiertiesValue(
            tUtils.isOverlap(xData, yData)
        )(baseFrequencyData);

        const scale = tUtils.getPropiertiesValue(
            tUtils.isOverlap(xData, yData)
        )(baseScaleData);

        // Clamp propierties value
        const baseFrequencyClamped = tUtils.getClampedPropiesties(
            this.invert,
            baseFrequency,
            this.maxFrequency,
            this.minFrequency
        );

        const scaleClamped = tUtils.getClampedPropiesties(
            this.invert,
            scale,
            this.maxScale,
            this.minScale
        );

        const turbolenceEl = this.store.getProp('turbolenceEl');
        const displacementMap = this.store.getProp('displacementMap');

        this.spring.goTo(
            { baseFrequency: baseFrequencyClamped, scale: scaleClamped },
            ({ baseFrequency, scale }) => {
                turbolenceEl.setAttribute(
                    'baseFrequency',
                    `${baseFrequency}`
                );
                displacementMap.setAttribute('scale', `${scale}`);
            }
        );
    }
}
