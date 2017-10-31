/**
 * Helper to convert minutes to hours
 */
import Ember from "ember";
import DateUtil from '../utils/date-util';

export default Ember.Helper.helper(function(params, hash) {
    var base = hash.base || "minutes";
	var format = hash.format;
    return DateUtil.create({}).convertToTimeStringWithFormat(params[0], base, format);
});