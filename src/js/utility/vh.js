import { eventManager } from "../base/eventManager.js";

class vhClass {

	constructor(images, callback) {
		this.lastWw = 0
	}


	init() {
		this.lastWw = eventManager.windowsWidth()
		this.calcVh()
		eventManager.push('resize', this.onResize.bind(this))
		eventManager.push('scroll', this.onScroll.bind(this))
	}

	calcVh() {
		let vh = window.innerHeight * 0.01
		document.documentElement.style.setProperty('--vh', `${vh}px`)
        console.log('calc vh')
	}

	onResize() {
		// if (eventManager.windowsWidth() != this.lastWw) {
			this.calcVh()
			this.lastWw = eventManager.windowsWidth();
		// }
	}

	onScroll() {
		if (eventManager.scrollTop() == 0) {
			this.calcVh();
		}
	}

}

export const vh = new vhClass()

// USAGE
// .my-element {
//   height: 100vh; /* Fallback for browsers that do not support Custom Properties */
//   height: calc(var(--vh, 1vh) * 100);
// }
