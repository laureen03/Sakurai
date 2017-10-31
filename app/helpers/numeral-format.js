import Ember from "ember";

export default Ember.Helper.helper(function(params) {
    //params[0] -> value, params[1]->format
    return numeral(params[0]).format(params[1]);
});
