class mouseManagerClass {
	constructor() {
		this.data = {
			'move': [],
			'start': [],
			'end': []
		},
		this.pointer = {
			x: 0,
			y: 0
		}
	}

	init() {
		window.addEventListener('mousemove', (e) => {
			const {
				pageX,
				pageY
			} = e;
			this.pointer.x = pageX
			this.pointer.y = pageY
			this.execute('move')
		})

		window.addEventListener('touchmove', (e) => {
			const {
				pageX,
				pageY
			} = e.touches[0]
			this.pointer.x = pageX
			this.pointer.y = pageY
			this.execute('move')
		})

		window.addEventListener('touchstart', () => {
			this.execute('start')
		});

		window.addEventListener('mousedown', () => {
			this.execute('start')
		});

		window.addEventListener('touchend', () => {
			this.execute('end')
		});

		window.addEventListener('mouseup', () => {
			this.execute('end')
		});

		window.addEventListener('mouseleave', () => {
			this.execute('end')
		});
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

	pointerX() {
		return this.pointer.x
	}

	pointerY() {
		return this.pointer.y
	}
}

export const mouseManager = new mouseManagerClass();
