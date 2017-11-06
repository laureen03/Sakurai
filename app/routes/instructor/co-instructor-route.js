import Route from '@ember/routing/route';
import ResetScroll from "mixins/reset-scroll";
import context from 'utils/context-utils';

export default Route.extend(
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
