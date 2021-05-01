import { eventManager } from "../../../js/base/eventManager.js";
import { lightImageDescription } from "./lightbox-image-description.js";
import { lightboxCommonDynamic } from "./lightbox-common-dynamic.js";

class lightBoxVideoClass {

  constructor() {
    if(!lightBoxVideoClass.instance){
      lightBoxVideoClass.instance = this;
      this.s = {
        _data: {},
        onResizeId: -1
      }
    }
    return lightBoxVideoClass.instance;
  }

  init(data) {
    this.s._data = data;
    eventManager.remove('resize', this.s.onResizeId)
    const $videoContainer = '<div class="lightbox__video"></div>';

    this.setVideoSize()

    this.s._data.$content.html($videoContainer);
    const $video = $('.lightbox__video');

    setTimeout(() => {
      $video.html(`<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${this.s._data.url }" frameborder="0" allowfullscreen></iframe>`)
      $video.addClass('visible');
    }, 200);

    this.s.onResizeId = eventManager.push('resize', this.setVideoSize.bind(this))
    this.openDescription(this.s._data);
  }

  setVideoSize() {
    const maxHeight = eventManager.windowsHeight() - eventManager.windowsHeight()/3,
          maxWidth = eventManager.windowsWidth() - eventManager.windowsWidth()/3,
          width = this.s._data.ratioW,
          height = this.s._data.ratioH,
          ratio = lightboxCommonDynamic.calculateAspectRatioFit(width,height,maxWidth,maxHeight);

    this.s._data.$content.css("width", ratio.width);
    this.s._data.$content.css("height",  ratio.height);
  }

  openDescription(data) {
    const _data = data

    lightImageDescription.init({
        title: _data.title,
        description: _data.description,
        $content: _data.$content
    })
  }

}

export const lightBoxVideo = new lightBoxVideoClass()
