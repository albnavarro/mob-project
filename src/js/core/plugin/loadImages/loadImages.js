export class LoadImages {
    constructor(images) {
        this.images = images;
        this.cont = 0;
        this.active = true;
    }

    load() {
        return new Promise((res, reject) => {
            const imageElArray = this.images.map((item) => {
                const img = new Image();
                img.src = item;
                return img;
            });

            for (const image of imageElArray) {
                if (image.complete) {
                    this.cont++;
                    if (this.cont == this.images.length) {
                        this.images = [];
                        res();
                    }
                } else {
                    image.addEventListener('load', () => {
                        this.cont++;
                        if (this.cont == this.images.length) {
                            if (this.active) {
                                this.images = [];
                                res();
                            } else {
                                const error = new Error('loading stop by user');
                                this.images = [];
                                reject(error);
                            }
                        }
                    });

                    image.addEventListener('error', () => {
                        const error = new Error(`image failed: ${image.src}`);
                        reject(error);
                    });
                }
            }
        });
    }

    stop() {
        this.active = false;
    }
}
