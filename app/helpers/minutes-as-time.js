/*
 * @param params[0] -number of minutes
 * @param options:
 *        h={string} string params[0] to use for hours
 *        m={string} string params[0] to use for minutes
 * @return time formatted using default time strings ('h', 'm') or custom strings as defined in options
 */
import Ember from "ember";

export default Ember.Helper.helper(function(params, hash){
    var hourStr, minStr, time, timeStr = '';

    Object.keys(hash).forEach(function (key) {
        if (typeof hash[key] === 'string') {
            hash[key] = I18n.t(hash[key]);
        }
    });

    hourStr = (hash && hash.h) ? ' ' + hash.h : 'h';
    minStr = (hash && hash.m) ? ' ' + hash.m : 'm';

    if (!numeral) {
        throw new Ember.Error("Global variable \'numeral\' is missing. Numeral.js library may be missing.");
    }

    if (typeof params[0] !== "number") {
        throw new Ember.Error("Wrong input type. minutesAsTime helper must be applied to a number.");
    }

    time = numeral(params[0] * 60).format('00:00:00').split(':');
    timeStr += (+time[0]) ? time[0] + hourStr + ' ' : '';
    timeStr += time[1] + minStr;

    return timeStr;
});
