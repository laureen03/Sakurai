import Ember from "ember";
import ResetScroll from "sakurai-webapp/mixins/reset-scroll";
import context from 'sakurai-webapp/utils/context';

export default Ember.Route.extend(
    ResetScroll,{

    setupController: function(controller) {
        var authenticationManager = context.get('authenticationManager'),
            user = authenticationManager.getCurrentUser();

        controller.set('instructorId', user.get('id'));
    },

    deactivate: function() {
        var controller = this.get("controller");
        controller.resetValues();
    }

});
