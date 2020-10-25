function modernizerFunc() {
    /*! modernizr 3.6.0 (Custom Build) | MIT *
    * https://modernizr.com/download/?-requestanimationframe-touchevents-prefixed-prefixedcss-prefixedcssvalue-setclasses !*/
    !function(e,n,t){function r(e){var n=_.className,t=Modernizr._config.classPrefix||"";if(w&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),w?_.className.baseVal=n:_.className=n)}function o(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function i(e,n){return typeof e===n}function s(){var e,n,t,r,o,s,a;for(var l in C)if(C.hasOwnProperty(l)){if(e=[],n=C[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(r=i(n.fn,"function")?n.fn():n.fn,o=0;o<e.length;o++)s=e[o],a=s.split("."),1===a.length?Modernizr[a[0]]=r:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=r),g.push((r?"":"no-")+a.join("-"))}}function a(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function l(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):w?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function f(){var e=n.body;return e||(e=l(w?"svg":"body"),e.fake=!0),e}function u(e,t,r,o){var i,s,a,u,c="modernizr",p=l("div"),d=f();if(parseInt(r,10))for(;r--;)a=l("div"),a.id=o?o[r]:c+(r+1),p.appendChild(a);return i=l("style"),i.type="text/css",i.id="s"+c,(d.fake?d:p).appendChild(i),d.appendChild(p),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(n.createTextNode(e)),p.id=c,d.fake&&(d.style.background="",d.style.overflow="hidden",u=_.style.overflow,_.style.overflow="hidden",_.appendChild(d)),s=t(p,e),d.fake?(d.parentNode.removeChild(d),_.style.overflow=u,_.offsetHeight):p.parentNode.removeChild(p),!!s}function c(e,n){return!!~(""+e).indexOf(n)}function p(e,n){return function(){return e.apply(n,arguments)}}function d(e,n,t){var r;for(var o in e)if(e[o]in n)return t===!1?e[o]:(r=n[e[o]],i(r,"function")?p(r,t||n):r);return!1}function m(n,t,r){var o;if("getComputedStyle"in e){o=getComputedStyle.call(e,n,t);var i=e.console;if(null!==o)r&&(o=o.getPropertyValue(r));else if(i){var s=i.error?"error":"log";i[s].call(i,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else o=!t&&n.currentStyle&&n.currentStyle[r];return o}function v(n,r){var o=n.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(a(n[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var i=[];o--;)i.push("("+a(n[o])+":"+r+")");return i=i.join(" or "),u("@supports ("+i+") { #modernizr { position: absolute; } }",function(e){return"absolute"==m(e,null,"position")})}return t}function h(e,n,r,s){function a(){u&&(delete k.style,delete k.modElem)}if(s=i(s,"undefined")?!1:s,!i(r,"undefined")){var f=v(e,r);if(!i(f,"undefined"))return f}for(var u,p,d,m,h,y=["modernizr","tspan","samp"];!k.style&&y.length;)u=!0,k.modElem=l(y.shift()),k.style=k.modElem.style;for(d=e.length,p=0;d>p;p++)if(m=e[p],h=k.style[m],c(m,"-")&&(m=o(m)),k.style[m]!==t){if(s||i(r,"undefined"))return a(),"pfx"==n?m:!0;try{k.style[m]=r}catch(g){}if(k.style[m]!=h)return a(),"pfx"==n?m:!0}return a(),!1}function y(e,n,t,r,o){var s=e.charAt(0).toUpperCase()+e.slice(1),a=(e+" "+E.join(s+" ")+s).split(" ");return i(n,"string")||i(n,"undefined")?h(a,n,r,o):(a=(e+" "+z.join(s+" ")+s).split(" "),d(a,n,t))}var g=[],C=[],S={_version:"3.6.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){C.push({name:e,fn:n,options:t})},addAsyncTest:function(e){C.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=S,Modernizr=new Modernizr;var x=S._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];S._prefixes=x;var _=n.documentElement,w="svg"===_.nodeName.toLowerCase(),b="Moz O ms Webkit",z=S._config.usePrefixes?b.toLowerCase().split(" "):[];S._domPrefixes=z;var T=function(e,n){var t=!1,r=l("div"),o=r.style;if(e in o){var i=z.length;for(o[e]=n,t=o[e];i--&&!t;)o[e]="-"+z[i]+"-"+n,t=o[e]}return""===t&&(t=!1),t};S.prefixedCSSValue=T;var E=S._config.usePrefixes?b.split(" "):[];S._cssomPrefixes=E;var P=function(n){var r,o=x.length,i=e.CSSRule;if("undefined"==typeof i)return t;if(!n)return!1;if(n=n.replace(/^@/,""),r=n.replace(/-/g,"_").toUpperCase()+"_RULE",r in i)return"@"+n;for(var s=0;o>s;s++){var a=x[s],l=a.toUpperCase()+"_"+r;if(l in i)return"@-"+a.toLowerCase()+"-"+n}return!1};S.atRule=P;var j=S.testStyles=u;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)t=!0;else{var r=["@media (",x.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");j(r,function(e){t=9===e.offsetTop})}return t});var N={elem:l("modernizr")};Modernizr._q.push(function(){delete N.elem});var k={style:N.elem.style};Modernizr._q.unshift(function(){delete k.style}),S.testAllProps=y;var q=S.prefixed=function(e,n,t){return 0===e.indexOf("@")?P(e):(-1!=e.indexOf("-")&&(e=o(e)),n?y(e,n,t):y(e,"pfx"))};S.prefixedCSS=function(e){var n=q(e);return n&&a(n)};Modernizr.addTest("requestanimationframe",!!q("requestAnimationFrame",e),{aliases:["raf"]}),s(),r(g),delete S.addTest,delete S.addAsyncTest;for(var L=0;L<Modernizr._q.length;L++)Modernizr._q[L]();e.Modernizr=Modernizr}(window,document);

}

export const modernzier = new modernizerFunc();
