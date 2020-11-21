export class loadImagesVanilla {

    constructor(images) {
        this.images = images
        this.cont = 0
        this.active = true
    }


    init() {
        return new Promise((res, reject) => {
            const imageElArray = this.images.map(item => {
                const img = new Image();
                img.src = item;
                return img;
            })

            for (const image of imageElArray) {
                if (image.complete) {
                    this.cont++;
                    if (this.cont == this.images.length) {
                        res();
                    }
                } else {
                    image.addEventListener('load', () => {
                        this.cont++;
                        if (this.cont == this.images.length) {
                            if (this.active) {
                                res()
                            } else {
                                const error = new Error('loading stop by user');
                                reject(error)
                            }
                        }
                    })

                    image.addEventListener('error', () => {
                        const error = new Error(`image failed: ${image.src}`);
                        reject(error)
                    })
                }
            }
        })
    }

    stop() {
        this.active = false
    }
}
