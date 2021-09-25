import { eventManager } from "../../../js/base/eventManager.js";
import { PredictiveTurbolenceItemClass } from "./predictiveTurbolenceItem.js";

class PredictiveTurbolenceClass {
	constructor() {
		this.predictiveItem = document.querySelectorAll(
			"*[data-conponent='m-comp--predictiveTurbolence']"
		);
		this.instances = [];
	}

	init() {
		eventManager.push("load", this.inzializeData.bind(this));
	}

	inzializeData() {
		const itemArray = Array.from(this.predictiveItem);
		const dataArray = itemArray.map((item, i) => {
			return this.getItemData(item, i);
		});

		for (const item of dataArray) {
			const predictiveItem = new PredictiveTurbolenceItemClass(item);
			this.instances.push(predictiveItem);
			predictiveItem.init();
		}
	}

	getItemData(item, i) {
		const data = {};
		data.item = item;
		data.counter = i;
		data.maxFrequency = item.getAttribute("data-maxfrequency") || "0.09";
		data.minFrequency = item.getAttribute("data-minfrequency") || "0.01";
		data.duration = item.getAttribute("data-duration") || "1.5";
		data.minScale = item.getAttribute("data-minScale") || "20";
		data.maxScale = item.getAttribute("data-maxScale") || "40";
		data.maxDistance = item.getAttribute("data-maxDistance") || "1500";
		data.invert = item.hasAttribute("data-invert");
		data.breackpoint = item.getAttribute("data-breackpoint") || "desktop";
		data.queryType = item.getAttribute("data-queryType") || "min";
		return data;
	}
}

export const predictiveTurbolence = new PredictiveTurbolenceClass();
