import { eventManager } from "../../../js/base/eventManager.js";
import {tBlocksItemClass} from "./tBlocksItem.js"

class tBlocksClass {

  constructor(data) {
      this.item = document.querySelectorAll("*[data-conponent='m-comp--tGallery']"),
      this.instances = []
  }

  init() {
      eventManager.push('load', this.inzializeData.bind(this));
  }

  inzializeData() {
      const itemArray = Array.from(this.item);
      for (const item of itemArray) {
          const tGalleryItem = new tBlocksItemClass(item);
          this.instances.push(tGalleryItem);
          tGalleryItem.init();
      }
  }
}

export const tBlocks = new tBlocksClass()
