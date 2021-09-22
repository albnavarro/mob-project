export function detectSafari() {
    let userAgentString = navigator.userAgent;
    let safariAgent = userAgentString.indexOf("Safari") > -1;
    let chromeAgent = userAgentString.indexOf("Chrome") > -1;
    if ((chromeAgent) && (safariAgent)) safariAgent = false;

    return safariAgent;
}
