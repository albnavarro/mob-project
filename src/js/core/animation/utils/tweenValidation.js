import { checkType } from '../../store/storeType';
import {
    sequencerRangeEndWarning,
    sequencerRangeStartWarning,
} from './warning';

/*
 * Check is value is number or function
 *
 **/
export const dataTweenValueIsValid = (val) => {
    return (
        checkType(Number, val) ||
        (checkType(Function, val) && checkType(Number, val()))
    );
};

/*
 * Validate start && end value in sequencer
 */
export const sequencerRangeValidate = ({ start, end }) => {
    const startIsValid = checkType(Number, start);
    const endIsValid = checkType(Number, end);
    if (!startIsValid) sequencerRangeStartWarning(start);
    if (!endIsValid) sequencerRangeEndWarning(end);
    return startIsValid && endIsValid;
};
