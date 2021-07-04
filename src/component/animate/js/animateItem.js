export class animateItemClass {
    constructor(data) {
        this.compRoot = data.compRoot;
        this.rootMargin = data.rootMargin;
        this.threshold = data.threshold;
        this.triggerEl = data.triggerEl;
        this.noRepeat = data.noRepeat;
        this.firstTime = false;
    }

    init() {
        const options = {
            root: null,
            rootMargin: `${this.rootMargin}px`,
            threshold: this.threshold,
        };

        const callback = (entries, observer) => {
            if (this.noRepeat && this.firstTime) return;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.compRoot.classList.add('animate');
                    this.firstTime = true;
                } else if (!entry.isIntersecting) {
                    this.compRoot.classList.remove('animate');
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);

        if (this.triggerEl) {
            const trigger = document.querySelector(this.triggerEl);
            observer.observe(trigger);
        } else {
            observer.observe(this.compRoot);
        }
    }
}
