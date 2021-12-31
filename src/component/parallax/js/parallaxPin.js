import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';
import { useScroll } from '.../../../js/core/events/scrollUtils/useScroll.js';

export class ParallaxPin {
    constructor(data) {
        this.parallaxInstance = data.instance;
        this.isScrolling = false;
        this.start = 0;
        this.startFromTop = 0;
        this.invertSide = null;
        this.end = 0;
        this.compesateValue = 0;
        this.trigger = null;
        this.item = null;
        this.spring = new useSpring('wobbly');
        this.wrapper = null;
        this.pin = null;
        this.isOver = false;
        this.isInner = false;
        this.isUnder = false;
        this.lastPosition = 0;
        this.lastTop = 0;
        this.unsubscribeScroll = () => {};
        this.unsubscribeSpring = () => {};
    }

    init() {
        // Get baisc element item ad if exist scrolltrigger
        this.invertSide = this.parallaxInstance.invertSide;
        this.item = this.parallaxInstance.item;
        this.trigger =
            this.parallaxInstance.scrollTrigger || this.parallaxInstance.item;

        // Update position
        this.refresh();

        // Wrap pin element
        // pin-wrapper , use to cache potion into dom flow when pin go to fixed
        const wrapper = document.createElement('div');
        wrapper.classList.add('pin-wrapper');
        // pin wrap that go to fixed pos
        const pin = document.createElement('div');
        pin.classList.add('pin');
        wrapper.appendChild(pin);
        this.item.parentNode.insertBefore(wrapper, this.item);
        pin.appendChild(this.item);
        this.wrapper = this.item.closest('.pin-wrapper');
        this.pin = this.item.closest('.pin');
        // Set misure to pin lement and wrap element
        const height = this.pin.offsetHeight;
        const width = this.pin.offsetWidth;
        this.wrapper.style.height = `${height}px`;
        this.wrapper.style.width = `${width}px`;
        this.pin.style.height = `${height}px`;
        this.pin.style.width = `${width}px`;

        // Set up motion
        this.spring = new useSpring('wobbly');
        this.spring.setData({ val: 0 });
        this.unsubscribeSpring = this.spring.subscribe(({ val }) => {
            this.pin.style.transform = `translateY(${val}px)`;
        });

        // Set up scroll
        this.unsubscribeScroll = useScroll(({ direction: scrollDirection }) => {
            this.onScroll(scrollDirection);
        });
    }

    /**
     * reset - on parallax refresh reset pin postion to permit parallax get right offset value
     * this before any aother operation in parallax reresh methods
     *
     * @return {void}
     */
    reset() {
        if (this.pin) {
            this.lastPosition = this.pin.style.position;
            this.lastTop = this.pin.style.top;
            this.pin.style.position = '';
            this.pin.style.top = ``;
            this.pin.style.left = ``;
        }
    }

    /**
     * refresh - on parallax refresh after all opration restore pin tp and position values
     * and get fresh data
     *
     * @return {void}
     */
    refresh() {
        this.start = this.parallaxInstance.startPoint;
        this.startFromTop = this.invertSide
            ? this.start
            : window.innerHeight - this.start;
        this.end = this.parallaxInstance.endPoint;
        this.compesateValue = this.invertSide
            ? -parseInt(this.end)
            : parseInt(this.end);

        if (this.pin) {
            this.pin.style.position = this.lastPosition;
            this.pin.style.top = this.lastTop;
        }
    }

    destroy() {
        this.unsubscribeScroll();
        this.unsubscribeSpring();
        this.spring = null;
    }

    onScroll(scrollDirection) {
        // Set up scroll condition
        const offsetTop = this.wrapper.getBoundingClientRect().top;

        const bottomCondition = !this.invertSide
            ? offsetTop > window.innerHeight - this.start
            : offsetTop < this.start;

        const innerCondition = !this.invertSide
            ? window.innerHeight - offsetTop < this.start + this.end
            : offsetTop > this.start && offsetTop < this.start + this.end;

        const topCondition = !this.invertSide
            ? window.innerHeight - offsetTop > this.start + this.end
            : offsetTop > this.start + this.end;

        if (bottomCondition) {
            if (!this.isUnder) {
                // Reset style
                this.pin.style.position = 'relative';
                this.pin.style.top = ``;
                this.pin.style.left = ``;
            }
            this.isUnder = true;
            this.isInner = false;
            this.isOver = false;
        } else if (innerCondition && !this.isInner) {
            if (!this.isInner) {
                const left = this.pin.getBoundingClientRect().left;
                this.pin.style.position = 'fixed';
                this.pin.style.left = `${left}px`;

                const fireSpring =
                    (scrollDirection === 'DOWN' && !this.invertSide) ||
                    (scrollDirection === 'UP' && this.invertSide);

                if (fireSpring) {
                    const gap =
                        this.wrapper.getBoundingClientRect().top -
                        this.startFromTop;

                    this.pin.style.top = `${this.startFromTop}px`;
                    this.spring.goFrom({ val: gap }).then(() => {
                        this.pin.style.transform = 'translateY(0px)';
                    });
                } else {
                    this.pin.style.top = `${this.startFromTop}px`;
                }
            }
            this.isUnder = false;
            this.isInner = true;
            this.isOver = false;
        } else if (topCondition) {
            if (!this.isOver) {
                // Reset style
                this.pin.style.position = 'relative';
                this.pin.style.left = ``;

                // Compensate value lost in fixed position
                this.pin.style.top = `${this.compesateValue}px`;
            }
            this.isUnder = false;
            this.isInner = false;
            this.isOver = true;
        }
    }
}
