import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{

    setupController: function(controller) {
        var authenticationManager = context.get('authenticationManager');
        var user = authenticationManager.getCurrentUser();
        controller.setDefaultValues(user.get('id'));
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }

});