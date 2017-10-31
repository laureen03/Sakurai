import Ember from "ember";
import DateUtil from '../utils/date-util';

export default Ember.Helper.helper(function(params) {
    //Presents the time zone abbreviation for current time
    return DateUtil.create({}).zoneAbbr(params[0]);
});