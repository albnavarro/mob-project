import axios from 'axios';
import { loadImages } from '../core';

class loadImageFromManifestClass {
    constructor() {
        this.distPath = '/assets/dist/';
    }

    init() {
        axios.get('/assets/dist/manifest.json').then((response) => {
            const data = response.data;

            const images = [
                `${this.distPath}${data['flower1.jpg']}`,
                `${this.distPath}${data['pic1.jpg']}`,
                `${this.distPath}${data['pic2.jpg']}`,
                `${this.distPath}${data['pic3.jpg']}`,
            ];

            const imageLoader = new loadImages(images);

            imageLoader
                .init()
                .then(() => console.log('image loaded'))
                .catch((e) => console.log(e));
        });
    }
}

export const loadImageFromManifest = new loadImageFromManifestClass();
