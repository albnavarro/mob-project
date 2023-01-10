import { forceRedraw } from '../../../js/utility/redrowNode.js';
import { detectSafari } from '../../../js/utility/isSafari.js';
import { tUtils } from './predictiveTurbolenceUtils.js';
import { outerHeight, outerWidth, offset } from '.../../../js/mobbu/utils/';
import { tween, core } from '../../../js/mobbu';

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
        this.spring = tween.createSpring();
        this.unsubscribeSpring = () => {};
        this.unsubscribeScroll = () => {};
        this.unsubscribeResize = () => {};
        this.unsubscribeMouseMove = () => {};

        // MOUSE COORD
        this.pageCoord = { x: 0, y: 0 };
        this.lastScrolledTop = 0;
    }

    init() {
        if (!core.mq(this.queryType, this.breackpoint)) return;

        this.spring.setData({ baseFrequency: 0, scale: 0 });

        this.unsubscribeSpring = this.spring.subscribe(
            ({ baseFrequency, scale }) => {
                if (this.turbolenceEl)
                    this.turbolenceEl.setAttribute(
                        'baseFrequency',
                        `${baseFrequency}`
                    );
                if (this.displacementMap)
                    this.displacementMap.setAttribute('scale', `${scale}`);
            }
        );

        this.inzializeSvg();
        this.onResize();

        this.unsubscribeMouseMove = core.useMouseMove(({ page }) => {
            this.setGlobalCoord({ page });
            this.onMove();
        });
        this.unsubscribeScroll = core.useScroll(({ scrollY }) => {
            this.onScroll({ scrollY });
        });
        this.unsubscribeResize = core.useResize(() => {
            this.onResize();
        });

        setTimeout(() => {
            this.redRawItem();
        }, 100);
    }

    destroy() {
        this.unsubscribeSpring();
        this.unsubscribeScroll();
        this.unsubscribeResize();
        this.unsubscribeMouseMove();
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
        const item = this.item;

        this.offsetY = offset(item).top;
        this.offsetX = offset(item).left;
        this.width = outerWidth(item);
        this.height = outerHeight(item);
    }

    setGlobalCoord({ page }) {
        this.pageCoord = { x: page.x, y: page.y };
    }

    onScroll({ scrollY }) {
        const scrollTop = window.pageYOffset;

        if (this.lastScrolledTop != scrollTop) {
            this.pageCoord.y -= this.lastScrolledTop;
            this.lastScrolledTop = scrollTop;
            this.pageCoord.y += this.lastScrolledTop;
        }

        this.onMove();
    }

    onMove() {
        const x = this.pageCoord.x;
        const y = this.pageCoord.y;

        // Define axsis data
        const xData = {
            position: x,
            offset: this.offsetX,
            dimension: this.width,
        };

        const yData = {
            position: y,
            offset: this.offsetY,
            dimension: this.height,
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

        this.spring
            .goTo({
                baseFrequency: baseFrequencyClamped,
                scale: scaleClamped,
            })
            .catch((err) => {});
    }
}
