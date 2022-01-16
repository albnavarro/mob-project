import { mq } from '../../../js/core/utils/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/core/utils/vanillaFunction.js';
import { handleResize } from '.../../../js/core/events/resizeUtils/handleResize.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';
import { handleLerp } from '.../../../js/core/animation/lerp/handleLerp.js';

export class PageScrollItemClass {
    constructor(data) {
        this.root = data.item;
        this.content = data.item.querySelector('.pageScroller__content');
        this.speed = data.speed;
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
        this.offsetTop = 0;
        this.rafOnScroll = null;
        this.startValue = 0;
        this.endValue = 0;
        this.prevValue = 0;
        this.firstTime = true;
        this.lerp = new handleLerp();
        this.unsubscribeResize = () => {};
        this.unsubscribeScroll = () => {};
        this.unsubscribeLerp = () => {};
    }

    init() {
        this.lerp.setData({ y: this.endValue });
        this.unsubscribeLerp = this.lerp.subscribe(({ y }) => {
            this.content.style.transform = `translateY(${-y}px)`;
        });

        this.setShadow();
        this.setOffset();
        this.setContent();
        this.unsubscribeResize = handleResize(() => {
            this.firstTime = true;
            this.setShadow();
            this.setOffset();
            this.setContent();
        });
        this.unsubscribeScroll = handleScroll(() => this.onScroll());
    }

    destroy() {
        this.unsubscribeLerp();
        this.unsubscribeResize();
        this.unsubscribeScroll();
    }

    setShadow() {
        const width = outerWidth(this.content);
        const height = outerHeight(this.content);

        const style = mq[this.queryType](this.breackpoint)
            ? {
                  width: `${width}px`,
                  height: `${height}px`,
              }
            : {
                  width: '',
                  height: '',
              };

        Object.assign(this.root.style, style);
    }

    setOffset() {
        this.content.style.position = 'static';
        this.content.style.transform = 'translateY(0)';
        this.offsetTop = offset(this.root).top;
    }

    setContent() {
        this.endValue = window.pageYOffset - this.offsetTop;
        const rect = this.root.getBoundingClientRect();
        const style = mq[this.queryType](this.breackpoint)
            ? {
                  position: 'fixed',
                  top: '0',
                  left: `${rect.left}px`,
                  right: '0',
              }
            : {
                  position: 'static',
                  top: '',
                  left: '',
                  right: '',
              };

        Object.assign(this.content.style, style);

        if (mq[this.queryType](this.breackpoint)) {
            this.lerp.set({ y: this.endValue }).catch((err) => {});
        } else {
            this.lerp.set({ y: 0 }).catch((err) => {});
        }
    }

    onScroll() {
        if (!mq[this.queryType](this.breackpoint)) return;
        this.endValue = window.pageYOffset - this.offsetTop;

        if (mq[this.queryType](this.breackpoint)) {
            if (this.firstTime) {
                this.lerp.set({ y: this.endValue }).catch((err) => {});
            } else {
                this.lerp
                    .goTo({ y: this.endValue })
                    .then((value) => {
                        this.firstTime = false;
                    })
                    .catch((err) => {});
            }
        } else {
            this.lerp.set({ y: 0 }).catch((err) => {});
        }
    }

    refresh() {
        this.setShadow();
        this.onEnter();
    }
}
