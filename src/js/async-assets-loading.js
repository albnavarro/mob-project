(function(w) {
	if (w.document.documentElement.className.indexOf('fonts-loaded') > -1) return;

	var
	osRegular = new w.FontFaceObserver('opensans', {
		weight: 400
	}),
	osBold = new w.FontFaceObserver('opensans', {
		weight: 300
	}),
    omBold = new w.FontFaceObserver('opensans', {
		weight: 700
	});


  w.Promise
  	.all([osRegular.load(), osBold.load(), omBold.load()])
  	.then(function() {
  		w.document.documentElement.className += ' fonts-loaded';
  	}).catch(function(err) {
      console.log(err);
    });
}(this));

/**
 * Load SVG symbols asynchronously
 */
var ajax = new XMLHttpRequest();
ajax.open('GET', document.getElementById('spriteSvg').getAttribute('data-svg'), true);
ajax.send();
ajax.onload = function(e) {
  var div = document.createElement('div');
  div.innerHTML = ajax.responseText;
	div.style.display = 'none';
  document.body.insertBefore(div, document.body.childNodes[0]);
}
