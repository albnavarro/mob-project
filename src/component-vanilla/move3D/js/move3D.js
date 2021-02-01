import {eventManager} from "../../../js/base/eventManager.js";
import {move3DContainerClass} from "./move3DContainer.js";

class move3DClass {
    constructor() {
        this.mouseItem = document.querySelectorAll("*[data-conponent='m-comp--move3D']");
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.mouseItem);
        const dataArray = itemArray.map(item => {
            return this.getItemData(item);
        })

        for (const item of dataArray) {
            const move3DContainer = new move3DContainerClass(item);
            this.instances.push(move3DContainer);
            move3DContainer.init();
        }
    }

    refresh() {
        for (const item of this.instances) {
            item.refresh();
        }
    }

    getItemData(item) {
        const data = {};
        data.item = item
        data.centerToViewoport = item.hasAttribute('data-centerToViewoport');
        data.pageY = item.hasAttribute('data-pageY');
        data.perspective = item.getAttribute('data-perspective') || 700
        data.xDepth = item.getAttribute('data-xDepth') || 20
        data.yDepth = item.getAttribute('data-yDepth') || 20
        data.xLimit = item.getAttribute('data-xLimit') || 35
        data.yLimit = item.getAttribute('data-yLimit') || 35
        data.drag = item.hasAttribute('data-drag')
        return data;
    }


}

export const move3D = new move3DClass()
