import { eventManager } from "../base/eventManager.js";

class vhClass {

  constructor(images,callback) {
    if(!vhClass.instance){
      vhClass.instance = this;
    }

    return vhClass.instance;
  }


  init(){
    this.calcVh()
    eventManager.push('resize', this.calcVh.bind(this))
    eventManager.push('scroll', this.onScroll.bind(this))
  }

  calcVh() {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  onScroll() {
    if(eventManager.scrollTop() == 0) {
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
