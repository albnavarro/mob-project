import { ParallaxItemClass } from './parallaxItem.js';

class ParallaxClass {
    constructor() {
        this.parallaxItem = document.querySelectorAll('.js-parallax');
        this.id = 0;
        this.instances = [];
    }

    init() {
        this.inzializeData();
    }

    inzializeData() {
        const dataArray = [...this.parallaxItem].map((item) => {
            return this.getItemData(item);
        });

        dataArray.forEach((item, i) => {
            this.id++;
            const parallaxItem = new ParallaxItemClass(item);
            this.instances.push({ id: this.id, istance: parallaxItem });
            parallaxItem.init();
        });
    }

    refresh() {
        for (const item of this.instances) {
            const { istance } = item;
            if (istance) istance.refresh();
        }
    }

    move() {
        for (const item of this.instances) {
            const { istance } = item;
            if (istance) istance.move();
        }
    }

    add(istance) {
        this.id++;
        this.instances.push({ id: this.id, istance: istance });
        return () => this.remove(this.id);
    }

    remove(id) {
        const newInstances = this.instances.filter((item) => {
            const { id: instaceId, istance } = item;
            const itemToRemove = instaceId === id;

            if (itemToRemove) {
                istance.unsubscribe();
            }
            return !itemToRemove;
        });

        this.instances = newInstances;
    }

    getItemData(item) {
        const data = {};
        data.item = item;

        // String: scrolltrigger || default
        data.type = item.getAttribute('data-type') || 'default';

        // String: 'vertical' || 'horizontal'
        data.direction = item.getAttribute('data-direction');

        // Custom container with a translate movement
        data.scroller = item.getAttribute('data-scroller');

        // Custom screen
        data.screen = item.getAttribute('data-screen');

        // FIXED PROPS
        // string marker id
        // es: marker: 'parallax-timeline'
        data.marker = item.getAttribute('data-marker');

        // enable pin
        data.pin = item.hasAttribute('data-pin');

        // use animation on pin collision
        data.animatePin = item.hasAttribute('data-animatePin');

        // use animation on pin collision
        data.forceTranspond = item.hasAttribute('data-forceTranspond');

        // anticipate pin on load, useful for element that start pinned
        // we are scure that element is pinned
        data.anticipatePinOnLoad = item.hasAttribute(
            'data-anticipatePinOnLoad'
        );

        // Boolean
        // Mandatory type = 'scrolltrigger'
        // Start from maximum value
        data.fromTo = item.hasAttribute('data-fromTo');

        // any:
        // data-start="bottom 20vh" -> start 20vh from bottom
        // data-start="top 20px" -> start 20px from top
        // vh is valid only in vertical mode
        // vw is valid ony in horzontal mode
        // value without misure unit is not allowed
        //
        // add special keyword:
        // +height -height
        // +halfHeight -halfHeight
        // +width -width
        // +halfWidth -halfWidth
        // "top 20px +height" || "bottom 20px +halfHeigh" || "bottom 20vh -halfWidth" || "bottom -halfWidth" etc..
        data.start = item.getAttribute('data-start');

        // any:
        // data-end="bottom 20h" -> end 20vh from bottom
        // data-end="top 20px" -> end 20px from top
        // vh is valid only in vertical mode
        // vw is valid ony in horzontal mode
        // value without misure unit is not allowed
        //
        // add special keyword:
        // +height -height
        // +halfHeight -halfHeight
        // +width -width
        // +halfWidth -halfWidth
        // "top 20px +height" || "bottom 20px +halfHeigh" || "bottom 20vh -halfWidth" || "bottom -halfWidth" etc..
        data.end = item.getAttribute('data-end');

        // String: in-stop - in-back - out-stop - out-back
        // Mandatory type = 'default' doasn't work with opacity
        // in-stop: stop the calculation reached zero
        // in-back : revert the calculation reached zero
        // out-stop: move element only ofter reached 0
        // out-back
        data.onSwitch = item.getAttribute('data-onSwitch');

        // String || number
        // Mandatory type = 'default'
        // start - top - center - bottom - end  || 1-100
        // start = zero at top of the document
        // top = zero at top of the viewport
        // center = zero at middle of the viewport
        // bottom = zero at bottom of the viewport
        // end = zero at bottom of the document
        data.align = item.getAttribute('data-align');

        // OPACITY PROPS

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity starts
        data.opacityStart = item.getAttribute('data-opacityStart');

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity ends
        data.opacityEnd = item.getAttribute('data-opacityEnd');

        // COMMON PROPS

        // Any
        // Range of movement
        // type = 'default'
        // form .1 to up less is the number bigger is the movement
        // Opacity : is alway from 0 to 1, is controlled by opacityStart and opacityEnd
        //
        // type = 'scrolltrigger'
        // horzontal / vertical:
        // '100h' => percent of item height
        // '100w' => percent of item width
        // '100px  => pixel value
        // '100vw' => pervent of viewport width
        // '100wh' => pervent of viewport height
        // negative number is valid es: '-100px' or '-100h%'
        //
        // Scale:
        // '0.3' add 0.3 to 1 -> final result is 1.3
        // '-0.3' substract 0.3 to 1 -> final result is 0.7
        //
        // Opacity: '-0.3' substract 0.3 to 1 -> final result is 0.7
        //
        // other ( rotate margin etcc..)
        // '90' -> 90 deg etc..
        data.range = item.getAttribute('data-range');

        data.perspective = item.getAttribute('data-perspective');

        // String: DOM element
        // Custom element on which to apply the calculated values
        // Default itself
        data.applyTo = document.querySelector(
            item.getAttribute('data-applyTo')
        );

        // String: DOM element
        // Performs calculations based on another element of the DOM at your choice
        data.trigger = item.getAttribute('data-trigger');

        // String
        data.breackpoint = item.getAttribute('data-breackpoint');

        // String
        // refer to mediaManager obj
        data.queryType = item.getAttribute('data-queryType');

        // Boolean
        // Diable force3D to create new layer
        data.disableForce3D = item.hasAttribute('data-disableForce3D');

        // use thorttle when ease is active and no pin used
        this.useThrottle = item.hasAttribute('data-useThrottle');

        // Boolean
        // By default the calculations are performed when the element is visible in the viewport,
        // with this attribute they will always be performed
        data.limiterOff = item.hasAttribute('data-limiterOff');

        // spring config
        // use string form spingConfig.js definition
        data.springConfig = item.getAttribute('data-springConfig');

        // spring config
        // use string form spingConfig.js definition
        data.lerpConfig = item.getAttribute('data-lerpConfig');

        // Boolean
        // Mandatory type = 'default'
        // inverts the calculated value
        data.reverse = item.hasAttribute('data-reverse');

        // String
        // Linear || smooth
        data.ease = item.hasAttribute('data-ease');

        // String
        // y , x , rotate , rotateX, rotateY, border-width , opacity, scale, custom
        data.propierties = item.getAttribute('data-propierties');

        // String
        // SPRING || LERP
        // Ease calculated in css or js
        data.easeType = item.getAttribute('data-easeType');

        return data;
    }
}

export const parallax = new ParallaxClass();
