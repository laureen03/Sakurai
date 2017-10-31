import Ember from "ember";
import DateUtil from '../utils/date-util';

export default Ember.Helper.helper(function(params, hash) {
    var dateUtil = (new DateUtil()),
    	date = params[0] || new Date(),
    	format = hash.format || 'lll',
    	timezone = hash.timezone || DateUtil.getLocalTimeZone(),
    	tz = (hash.tz != null && hash.tz === false) ? false: true;
    return dateUtil.format(date, format, timezone, tz);
});
