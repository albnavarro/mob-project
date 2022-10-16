import {
    STAGGER_START,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_END,
    STAGGER_TYPE_EQUAL,
} from './stagger/staggerCostant';

export const compareKeysWarning = (label, fromObj, toObj) => {
    console.warn(
        `${label}: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
            toObj
        )} is not equal`
    );
};

export const staggerIsOutOfRangeWarning = (max) => {
    console.warn(
        `stagger col of grid is out of range, it must be less than ${max} ( staggers length )`
    );
};

export const dataTweenValueIsNotValidWarning = (label) => {
    console.warn(
        `tween | sequencer: ${label} is not valid value, must be a number or a function`
    );
};

export const sequencerRangeStartWarning = (val) => {
    console.warn(
        `sequencer, start option: ${val} value is not valid, must be a Number`
    );
};

export const sequencerRangeEndWarning = (val) => {
    console.warn(
        `sequencer, end option: ${val} value is not valid, must be a Number`
    );
};

export const relativePropInsideTimelineWarning = () => {
    console.warn('relative prop is not allowed inside a timeline');
};

export const timelineSuspendWarning = (val) => {
    console.warn(
        `Timeline Supend: ${val()} is not a valid value, must be a boolean`
    );
};

export const timelineReverseGoFromWarning = () => {
    console.warn(
        `SyncTimeline: in revese ( or yoyo mode) only goTo || goFromTo || set action is allowed. Using goFrom makes no sense in this context. Timeline will stopped.`
    );
};

export const timelineSyncWarning = (val) => {
    console.warn(`timeline.sync(): ${val} is not a tween`);
};

export const timelineSetTweenArrayWarining = (items) => {
    console.warn(`timeline setTween: ${items} is not an array of tween`);
};

export const timelineSetTweenLabelWarining = (label) => {
    console.warn(`timeline setTween: ${label} is not a string`);
};

export const timelineSetTweenLabelNotFoundWarining = (label) => {
    console.warn(`asyncTimeline.setTween() label: ${label} not found`);
};

export const timelineSetTweenFailWarining = () => {
    console.warn('setTween fail');
};

export const syncTimelineLabelWarning = (label) => {
    console.warn(`label ${label} not founded`);
};

export const syncTimelineAddFnWarning = (fn) => {
    console.warn(`sequencer.add(fn,time) ${fn}: fn must be Function`);
};

export const syncTimelineAddTimeWarning = (time) => {
    console.warn(`sequencer.add(fn,time) ${time}: time must be a Number`);
};

export const springPresetWarning = (preset) => {
    console.warn(`${preset} doasn't exist in spring configuration list`);
};

export const tweenEaseWarning = (preset) => {
    console.warn(`${preset} doasn't exixst in tweens ease function`);
};

export const staggerEachWarning = () => {
    console.warn(`stagger each must be a Number `);
};

export const staggerRowColGenericWarining = (val) => {
    console.warn(
        `stagger, row/col: ${val} value is not valid, must be a Number`
    );
};

export const staggerWaitCompleteWarning = () => {
    console.warn('Stagger error: waitComplete propierties must be a Boolean');
};

export const staggerGridDirectionWarning = () => {
    console.warn(
        `Stagger error: in grid option direction should be a string radial/col/row`
    );
};

export const staggerRadialDirectionWarning = () => {
    console.warn(
        `Stagger error: in radial direction 'from' propierties must be a object {x:Number,y:Number}`
    );
};

export const staggerRadialColRowWarning = () => {
    console.warn(
        `Stagger error: in radial direction 'col' or 'row' is not setted, or is minor than 1, must be a number grater than 1`
    );
};

export const staggerColRowWarning = () => {
    console.warn(
        `Stagger error: in col/row direction 'from' propierties must be a string start/end/center/edges or a number`
    );
};

export const staggerFromGenericWarning = (from) => {
    console.warn(
        `Stagger error: from: ${from} is not a valid value, must be a string start/end/center/edges or a number or a Object {x:Number,y:Number}`
    );
};

export const durationWarining = (value) => {
    console.warn(
        `duration error: ${value} is not valid duration must be a number`
    );
};

export const yoyoWarining = (value) => {
    console.warn(
        `yoyo error: ${value} is not valid yoyo value must be a Boolean`
    );
};

export const repeatWarining = (value) => {
    console.warn(
        `repeat error: ${value} is not valid repeat value must be a Number`
    );
};

export const easeWarning = (ease) => {
    console.warn(`ease definition error: ${ease} is not a valid  definition`);
};

export const initialDataPropWarining = (prop) => {
    console.warn(
        `data inizializiation error; ${prop} is not a valid value, must be a string`
    );
};

export const initialDataValueWarining = (value) => {
    console.warn(
        `data inizializiation error; ${value} is not a valid value, must be a number`
    );
};

export const createStaggerItemsWarning = () => {
    console.warn(`createStaggers error: items array can not be empty`);
};

export const createStaggerItemsTypeWarning = () => {
    console.warn(
        `createStaggers error: each element of the array must be an Element or an Object`
    );
};

export const createStaggerTypeWarning = () => {
    console.warn(
        `screateStaggers error: type should be: ${STAGGER_TYPE_EQUAL} || ${STAGGER_START} || ${STAGGER_TYPE_END} || ${STAGGER_TYPE_CENTER}`
    );
};

export const createStaggerEachWarning = (eachProportion) => {
    console.warn(
        `createStagger:  each must be between 1 and ${eachProportion}`
    );
};
