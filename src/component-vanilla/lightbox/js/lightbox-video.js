import { eventManager } from "../../../js/base/eventManager.js";
import { lightImageDescription } from "./lightbox-image-description.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";

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
        const $video = this.data.content.querySelector('.lightbox__video');

        setTimeout(() => {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${this.data.url }`;
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            $video.appendChild(iframe);
            $video.classList.add('visible');
        }, 200);

        this.onResizeId = eventManager.push('resize', this.setVideoSize.bind(this))
        this.openDescription(this.data);
    }

    setVideoSize() {
        const maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight() / 3,
            maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth() / 3,
            width = this.data.ratioW,
            height = this.data.ratioH,
            ratio = lightboxCommonDynamic.calculateAspectRatioFit(width, height, maxWidth, maxHeight);

        const style = {
            'width': ratio.width + 'px',
            'height': ratio.height + 'px'
        };
        Object.assign(this.data.content.style, style);
    }

    openDescription(data) {
        lightImageDescription.init({
            title: data.title,
            description: data.description,
            content: data.content
        })
    }

}

export const lightBoxVideo = new lightBoxVideoClass()
