import {eventManager} from "./eventManager.js";

class mouseManagerClass {
	constructor() {
		this.data = {
			'mousemove': [],
			'touchmove': [],
			'mousedown': [],
			'mouseup': [],
			'touchstart': [],
			'touchend': [],
			'scroll': []
		}
		this.page = {
			x: 0,
			y: 0
		}
		this.client = {
			x: 0,
			y: 0
		}
		this.target = null
		this.stackId = -1,
		this.lastScrolledTop = 0
	}

	init() {
		window.addEventListener('mousemove', (e) => {
			this.target = e.target
			const {
				pageX,
				pageY
			} = e;
			this.page.x = pageX
			this.page.y = pageY

			const {
				clientX,
			    clientY
			} = e;
			this.client.x = clientX
			this.client.y = clientY


			this.execute('mousemove')
		})

		window.addEventListener('touchmove', (e) => {
			const {
				pageX,
				pageY
			} = e.touches[0]
			this.page.x = pageX
			this.page.y = pageY

			this.execute('touchmove')
		})

		window.addEventListener('mousedown', () => {
			this.execute('mousedown')
		});

		window.addEventListener('mouseup', () => {
			this.execute('mouseup')
		});

		window.addEventListener('mouseleave', () => {
			this.execute('mouseup')
		});

		window.addEventListener('touchstart', () => {
			this.execute('touchstart')
		});

		window.addEventListener('touchend', () => {
			this.execute('touchend')
		});

		eventManager.push('scroll', this.onScroll.bind(this));

	}

	onScroll() {
		const scrollTop = eventManager.scrollTop()

        if(this.lastScrolledTop != scrollTop){
			this.page.y -= this.lastScrolledTop
            this.lastScrolledTop = scrollTop
			this.page.y += this.lastScrolledTop
        }

		this.execute('scroll')
	}

	execute(_properties) {
		if (this.data.hasOwnProperty(_properties)) {
			for (let index = 0; index < this.data[_properties].length; index++) {
				const item = this.data[_properties][index];

				item.func()
			}
		}
	}

	push(_properties, _function, _order = 100) {
		if (this.data.hasOwnProperty(_properties)) {

			this.stackId++
			let obj = {
				id: this.stackId,
				func: _function,
				order: _order
			}
			this.data[_properties].push(obj);
			this.updateOrder(_properties);

			return this.stackId
		}
	}

	remove(_properties, _id) {
		this.data[_properties] = this.data[_properties].filter((obj) => obj.id != _id);
	}

	updateItemOrder(_properties, _id, _order) {
		const index = this.data[_properties].findIndex((obj) => obj.id == _id);
		this.data[_properties][index].order = _order;
		this.updateOrder(_properties);
	}

	updateOrder(_properties) {
		if (this.data.hasOwnProperty(_properties)) {
			this.data[_properties].sort((obj1, obj2) => obj1.order - obj2.order);
		}
	}

	pageX() {
		return this.page.x
	}

	pageY() {
		return this.page.y
	}

	clientX() {
		return this.client.x
	}

	clientY() {
		return this.client.y
	}

	getTarget() {
		return this.target
	}
}

export const mouseManager = new mouseManagerClass();
