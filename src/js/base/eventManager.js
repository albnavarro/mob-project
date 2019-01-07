class eventManagerClass {

  constructor() {
    if(!eventManagerClass.instance){
      this.$ = {
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
    this.$.scrollDirection = this.$.scrollDown


    this.$._scrollUtility = scrollUtility
    this.$._throttle = useThrottle

    window.addEventListener('scroll', this.onScroll.bind(this), false);
    window.onresize = debounce(this.resize.bind(this), 200);

    if(this.$._throttle) {
      window.addEventListener('scroll', throttle(this.onThrottle.bind(this), 60), false);
    }

    if(this.$._scrollUtility) {
      window.onscroll = debounce(this.detectScrollEnd.bind(this), 200);
    }

    document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        this.$.windowsWidth = window.innerWidth
        this.$.windowsHeight = window.innerHeight
        this.$.scrollTop =  window.pageYOffset
        this.$.documentHeight = document.documentElement.scrollHeight
        this.execute('load')
      }
    }
  }

  onThrottle() {
    this.execute('scrollThrottle')
  }

  onScroll() {
    this.$.scrollTop = window.pageYOffset

    if (this.$.lastScrollTop > this.$.scrollTop ) {
      this.$.scrollDirection = this.$.scrollUp
    } else {
      this.$.scrollDirection = this.$.scrollDown
    }

    this.$.lastScrollTop = this.$.scrollTop

    this.requestTick()

    if (!this.$.isScrolling && this.$._scrollUtility) {
      this.$.isScrolling = true;
      this.execute('scrollStart')
    }
  }

  resize(e) {
    this.$.windowsWidth = window.innerWidth
    this.$.windowsHeight = window.innerHeight
    this.$.scrollTop =  window.pageYOffset
    this.$.documentHeight = document.documentElement.scrollHeight
    this.execute('resize')
  }

  requestTick() {
    if(!this.$.ticking) {
      requestAnimationFrame(this.updateScroll.bind(this))
      this.$.ticking = true
    }
  }

  updateScroll() {
    this.execute('scroll')
    this.$.ticking = false;
  }

  detectScrollEnd() {
    this.$.isScrolling = false
    this.execute('scrollEnd')
  }

  execute(_properties) {
    if(this.$.data.hasOwnProperty(_properties)) {
      for (let index = 0; index < this.$.data[_properties].length; index++) {
        const item = this.$.data[_properties][index];

        item.func()
      }
    }
  }

  push(_properties,_function) {
    if(this.$.data.hasOwnProperty(_properties)) {

      this.$.stackId++
      let obj = {
        id: this.$.stackId,
        func: _function
      }
      this.$.data[_properties].push(obj);

      return this.$.stackId
    }
  }

  remove(_properties, _id) {
    this.$.data[_properties] =  this.$.data[_properties].filter(function(obj) {
    	return obj.id != _id;
    });
  }

  windowsHeight() {
    return this.$.windowsHeight
  }

  windowsWidth() {
    return this.$.windowsWidth
  }

  scrollTop() {
    return this.$.scrollTop
  }

  documentHeight() {
    return this.$.documentHeight
  }

  scrollDirection() {
    return this.$.scrollDirection
  }
}

const eventManager = new eventManagerClass()
