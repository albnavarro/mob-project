class seriesClass {

  constructor() {
    this.s = {
      arr: [],
      index: 0
    }
  }

  push(fn, context, last = false) {
    if(!last) {
      this.s.arr.push(fn.bind(context, this.next.bind(this)))
    } else {
      this.s.arr.push(fn.bind(context))
    }
  }

  go() {
    this.s.index = 0;
    const fn = this.s.arr[0]
    this.s.index ++;
    fn();
  }

  next() {
    const fn = this.s.arr[this.s.index]
    this.s.index ++;
    fn();
  }
}

// ISTANCE EXAMPLE:
// const serie = new seriesClass();
// serie.push(popToggle1.test, popToggle1);
// serie.push(popToggle2.test, popToggle2);
// serie.push(popToggle3.test, popToggle3, true);
// serie.go();


// METHOD EXAMPLE:

// test(callback = null) {
//   setTimeout(() => {
//     console.log(this.s.name);
//     if(callback) callback();
//   }, 1000)
// }
