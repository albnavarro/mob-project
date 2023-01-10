import axios from 'axios';
import { LoadImages } from '../mobbu/plugin';

class loadImageFromManifestClass {
    constructor() {
        this.distPath = '/assets/dist/';
    }

    init() {
        axios.get('/assets/dist/manifest.json').then((response) => {
            const data = response.data;

            const imagelist = [
                `${this.distPath}${data['flower1.jpg']}`,
                `${this.distPath}${data['pic1.jpg']}`,
                `${this.distPath}${data['pic2.jpg']}`,
                `${this.distPath}${data['pic3.jpg']}`,
            ];

            const imageLoader = new LoadImages(imagelist);

            imageLoader
                .load()
                .then(() => console.log('image loaded'))
                .catch((e) => console.log(e));
        });
    }
}

export const loadImageFromManifest = new loadImageFromManifestClass();
