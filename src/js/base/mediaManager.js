var mq = {

  $: {
    'x-small': '320',
    'small':   '360',
    'medium':  '600',
    'tablet':  '768',
    'desktop': '992',
    'large':   '1200',
    'x-large':   '1400'
  },

  max: function(breakpoint) {
    return eventManager.windowsWidth() < mq.$[breakpoint];
  },

  min: function(breakpoint) {
    return eventManager.windowsWidth() >= mq.$[breakpoint];
  }
}
