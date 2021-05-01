import { eventManager } from "../../../js/base/eventManager.js";
import { lightDescription } from "./lightbox-description.js";
import { lightboxUtils } from "./lightbox-utils.js";

class lightBoxVideoClass {

    constructor() {
        this.data = {};
        this.onResizeId = -1;
    }

    init(data) {
        this.data = data;
        eventManager.remove('resize', this.onResizeId)

        const videoEl = document.createElement('div');
        videoEl.classList.add('lightbox__video');

        this.setVideoSize()

        this.data.content.appendChild(videoEl);
        const videoWrapper = this.data.content.querySelector('.lightbox__video');

        setTimeout(() => {
            switch (this.data.sourceType) {
                case 'youtube':
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${this.data.url }`;
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('frameborder', '0');
                    videoWrapper.appendChild(iframe);
                break;

                case 'local':
                    const video = document.createElement('video');
                    video.setAttribute('controls', '');
                    video.setAttribute('autoplay', '');
                    video.setAttribute('loop', '');

                    const source = document.createElement('source');
                    source.setAttribute('type', 'video/mp4');
                    source.src = this.data.url;

                    videoWrapper.appendChild(video);
                    const videoEl = videoWrapper.querySelector('video');
                    videoEl.appendChild(source);
                break;

            }

            videoWrapper.classList.add('visible');
        }, 200);

        this.onResizeId = eventManager.push('resize', this.setVideoSize.bind(this))
        this.openDescription(this.data);
    }

    setVideoSize() {
        // WW and WH gap
        const Hgap = (eventManager.windowsHeight() / 100) * parseInt(this.data.Hgap);
        const Wgap = (eventManager.windowsWidth() / 100) * parseInt(this.data.Wgap);

        const maxHeight = eventManager.windowsHeight() - Hgap,
            maxWidth = eventManager.windowsWidth() - Wgap,
            width = this.data.ratioW,
            height = this.data.ratioH,
            ratio = lightboxUtils.calculateAspectRatioFit(width, height, maxWidth, maxHeight);

        const style = {
            'width': ratio.width + 'px',
            'height': ratio.height + 'px'
        };
        Object.assign(this.data.content.style, style);
    }

    openDescription(data) {
        lightDescription.init({
            title: data.title,
            description: data.description,
            content: data.content
        })
    }

}

export const lightBoxVideo = new lightBoxVideoClass()
