function throttle(fn, threshhold, scope){
  threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var self = scope || this;

      var now = +new Date,
          args = arguments;

      if (last && now < last + threshhold) {
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(self, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(self, args);
      }
    };
};
