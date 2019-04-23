class eventManagerClass {

  constructor() {
    if(!eventManagerClass.instance){
      this.s = {
        data: {
          'scroll': [],
          'scrollThrottle': [],
          'scrollStart': [],
          'scrollEnd': [],
          'resize': [],
          'load': []
        },
        windowsHeight : window.innerHeight,
        windowsWidth : window.innerWidth,
        scrollTop : window.pageYOffset,
        documentHeight: document.documentElement.scrollHeight,
        lastScrollTop: window.pageYOffset,
        scrollUp: 'UP',
        scrollDown: 'DOWN',
        scrollDirection: '',
        ticking : false,
        stackId : -1,
        timeout: null,
        isScrolling: false,
        _scrollUtility: false,
        _throttle: true
      }
      eventManagerClass.instance = this;
    }
    return eventManagerClass.instance;
  }

  init(scrollUtility = false, useThrottle = true){
    this.s.scrollDirection = this.s.scrollDown


    this.s._scrollUtility = scrollUtility
    this.s._throttle = useThrottle

    window.addEventListener('scroll', this.onScroll.bind(this), false);
    window.onresize = debounce(this.resize.bind(this), 200);

    if(this.s._throttle) {
      window.addEventListener('scroll', throttle(this.onThrottle.bind(this), 60), false);
    }

    if(this.s._scrollUtility) {
      window.onscroll = debounce(this.detectScrollEnd.bind(this), 200);
    }

    document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        this.s.windowsWidth = window.innerWidth
        this.s.windowsHeight = window.innerHeight
        this.s.scrollTop =  window.pageYOffset
        this.s.documentHeight = document.documentElement.scrollHeight
        this.execute('load')
      }
    }
  }

  onThrottle() {
    this.execute('scrollThrottle')
  }

  onScroll() {
    this.s.scrollTop = window.pageYOffset

    if (this.s.lastScrollTop > this.s.scrollTop ) {
      this.s.scrollDirection = this.s.scrollUp
    } else {
      this.s.scrollDirection = this.s.scrollDown
    }

    this.s.lastScrollTop = this.s.scrollTop

    this.requestTick()

    if (!this.s.isScrolling && this.s._scrollUtility) {
      this.s.isScrolling = true;
      this.execute('scrollStart')
    }
  }

  resize(e) {
    this.s.windowsWidth = window.innerWidth
    this.s.windowsHeight = window.innerHeight
    this.s.scrollTop =  window.pageYOffset
    this.s.documentHeight = document.documentElement.scrollHeight
    this.execute('resize')
  }

  requestTick() {
    if(!this.s.ticking) {
      requestAnimationFrame(this.updateScroll.bind(this))
      this.s.ticking = true
    }
  }

  updateScroll() {
    this.execute('scroll')
    this.s.ticking = false;
  }

  detectScrollEnd() {
    this.s.isScrolling = false
    this.execute('scrollEnd')
  }

  execute(_properties) {
    if(this.s.data.hasOwnProperty(_properties)) {
      for (let index = 0; index < this.s.data[_properties].length; index++) {
        const item = this.s.data[_properties][index];

        item.func()
      }
    }
  }

  push(_properties,_function) {
    if(this.s.data.hasOwnProperty(_properties)) {

      this.s.stackId++
      let obj = {
        id: this.s.stackId,
        func: _function
      }
      this.s.data[_properties].push(obj);

      return this.s.stackId
    }
  }

  remove(_properties, _id) {
    this.s.data[_properties] =  this.s.data[_properties].filter(function(obj) {
    	return obj.id != _id;
    });
  }

  windowsHeight() {
    return this.s.windowsHeight
  }

  windowsWidth() {
    return this.s.windowsWidth
  }

  scrollTop() {
    return this.s.scrollTop
  }

  documentHeight() {
    return this.s.documentHeight
  }

  scrollDirection() {
    return this.s.scrollDirection
  }
}

const eventManager = new eventManagerClass()
