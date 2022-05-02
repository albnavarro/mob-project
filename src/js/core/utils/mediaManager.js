export const mq = (() => {
    let media = {
        'x-small': '320',
        small: '360',
        medium: '600',
        tablet: '768',
        desktop: '992',
        large: '1200',
        'x-large': '1400',
    };

    const max = (breakpoint) => window.innerWidth < media[breakpoint];
    const min = (breakpoint) => window.innerWidth >= media[breakpoint];
    const update = (obj) => (media = { ...obj });

    return { max, min, update };
})();
