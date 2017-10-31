// is-equal helper is necessary to determine which option is currently selected.
import Ember from "ember";

export default Ember.Helper.helper(function(params){
  return params[0] === params[1];
});