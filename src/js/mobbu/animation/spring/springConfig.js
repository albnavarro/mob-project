/**
 * @typedef {Object} springConfigTypes
 * @prop {('default'|'gentle'|'wobbly'|'bounce'|'scroller')} config spring configuration list
 **/

/**
 * @typedef {Object} springConfigParallaxTypes
 * @prop {('default'|'gentle'|'wobbly'|'bounce'|'scroller')} [ springConfig = 'default' ] spring configuration list
 **/

/**
 * @typedef {Object} springConfigPropsTypes
 * @prop {Object} configProp single spring config propierties
 * @prop {Number} [ configProp.tension ] tension - A positive number
 * @prop {Number} [ configProp.mass ] mass - A positive number
 * @prop {Number} [ configProp.friction ] friction - A positive number
 * @prop {Number} [ configProp.velocity ] velocity - A positive number
 * @prop {Number} [ configProp.precision ] precision - A positive number
 **/

/**
 * @typedef {('default'|'gentle'|'wobbly'|'bounce'|'scroller')} springConfigStringTypes
 **/
export const springPresetConfig = {
    default: {
        tension: 20,
        mass: 1,
        friction: 5,
        velocity: 0,
        precision: 0.01,
    },
    gentle: {
        tension: 120,
        mass: 1,
        friction: 14,
        velocity: 0,
        precision: 0.01,
    },
    wobbly: {
        tension: 180,
        mass: 1,
        friction: 12,
        velocity: 0,
        precision: 0.01,
    },
    bounce: {
        tension: 200,
        mass: 3,
        friction: 5,
        velocity: 0,
        precision: 0.01,
    },
    scroller: {
        tension: 10,
        mass: 1,
        friction: 5,
        velocity: 0,
        precision: 0.5,
    },
};
