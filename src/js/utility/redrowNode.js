export const forceRedraw = function(element){
    if (!element) { return; }

    const n = document.createTextNode(' ');
    const disp = element.style.display;  // don't worry about previous display style

    element.appendChild(n);
    element.style.display = 'none';

    setTimeout(function(){
        element.style.display = disp;
        n.parentNode.removeChild(n);
    }, 20); // you can play with this timeout to make it as short as possible
}
