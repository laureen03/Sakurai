import Ember from "ember";

export default Ember.Helper.helper(function(params, hash) {
    var message;

    message = I18n.t(params[0], hash);
    return message;
});

