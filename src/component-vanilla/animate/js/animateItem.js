export class animateItemClass {
    constructor(data) {
        this.compRoot = data.compRoot;
        this.rootMargin = data.rootMargin;
        this.threshold = data.threshold;
        this.triggerEl = data.triggerEl;
    }

    init() {
        const options = {
            root: null,
            rootMargin: `${this.rootMargin}px`,
            threshold: this.threshold
        }

        const callback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.compRoot.classList.add('animate');

                } else if (!entry.isIntersecting) {
                    this.compRoot.classList.remove('animate');
                }
            });
        }

        const observer = new IntersectionObserver(callback, options);

        if(this.triggerEl) {
            const trigger =  document.querySelector(this.triggerEl)
            observer.observe(trigger);
        } else {
            observer.observe(this.compRoot);
        }
    }
}
